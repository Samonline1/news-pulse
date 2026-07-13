from __future__ import annotations

import re
from email.utils import parsedate_to_datetime
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from itertools import count
import logging
from typing import Any

from database.mongo import get_database
from services.ai_service import generate_title


logger = logging.getLogger(__name__)


STOP_WORDS = {
    "a",
    "about",
    "after",
    "again",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "just",
    "me",
    "more",
    "most",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "now",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "same",
    "she",
    "should",
    "so",
    "some",
    "such",
    "than",
    "that",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "with",
    "would",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
}

# Tokens
WORD_RE = re.compile(r"[a-z0-9]+")
MIN_LABEL_WORD_LENGTH = 3
MAX_LABEL_WORDS = 4
MIN_LABEL_WORDS = 2


@dataclass(frozen=True, slots=True)
class ClusterSummary:
    cluster_id: str
    label: str
    article_count: int
    title_generated: bool
    sources: list[str]
    start_time: datetime | None
    end_time: datetime | None


@dataclass(frozen=True, slots=True)
class ClusterRunResult:
    clusters: list[ClusterSummary]
    total_articles: int


# Keywords
def _build_keywords(article: dict[str, Any]) -> set[str]:
    text = f"{article.get('title', '')} {article.get('summary', '')}".lower()
    tokens = WORD_RE.findall(text)
    return {token for token in tokens if token not in STOP_WORDS}


# Labels
def _extract_label_words(text: str) -> list[str]:
    tokens = WORD_RE.findall(text.lower())
    return [
        token
        for token in tokens
        if len(token) >= MIN_LABEL_WORD_LENGTH
        and token not in STOP_WORDS
        and not token.isdigit()
        and len(set(token)) > 1
    ]


# Parse
def _parse_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if not value:
        return None
    if isinstance(value, str):
        try:
            parsed = parsedate_to_datetime(value)
            if parsed is None:
                parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):
            return None
    return None


# Build
def _format_label(keyword_counts: Counter[str]) -> str:
    # Prefer the most frequent meaningful keywords and keep the label human-readable.
    selected_keywords: list[str] = []
    for keyword, _ in keyword_counts.most_common():
        if keyword not in selected_keywords:
            selected_keywords.append(keyword)
        if len(selected_keywords) == MAX_LABEL_WORDS:
            break

    if len(selected_keywords) < MIN_LABEL_WORDS:
        return "General"

    return " ".join(word.capitalize() for word in selected_keywords[:MAX_LABEL_WORDS])


# Name
def _build_cluster_label(group_articles: list[dict[str, Any]]) -> str:
    title_counts: Counter[str] = Counter()
    overall_counts: Counter[str] = Counter()
    first_seen: dict[str, int] = {}

    for position, item in enumerate(group_articles):
        article = item["article"]
        title_words = _extract_label_words(str(article.get("title", "")))
        summary_words = _extract_label_words(str(article.get("summary", "")))

        for word in title_words:
            title_counts[word] += 2
            overall_counts[word] += 2
            first_seen.setdefault(word, position)

        for word in summary_words:
            overall_counts[word] += 1
            first_seen.setdefault(word, position)

    if not overall_counts:
        return "General"

    ranked_words = sorted(
        overall_counts.items(),
        key=lambda item: (
            -item[1],
            -title_counts.get(item[0], 0),
            first_seen.get(item[0], 0),
            item[0],
        ),
    )

    selected_words: list[str] = []
    for word, _ in ranked_words:
        if word in selected_words:
            continue
        selected_words.append(word)
        if len(selected_words) == MAX_LABEL_WORDS:
            break

    if len(selected_words) < MIN_LABEL_WORDS:
        return "General"

    return " ".join(word.title() for word in selected_words)


# Range
def _collect_cluster_time_bounds(group_articles: list[dict[str, Any]]) -> tuple[datetime | None, datetime | None]:
    published_times: list[datetime] = []

    for item in group_articles:
        published_at = _parse_datetime(item["article"].get("published"))
        if published_at is not None:
            published_times.append(published_at)

    if not published_times:
        return None, None

    return min(published_times), max(published_times)


def _get_headlines(group_articles: list[dict[str, Any]]) -> list[str]:
    return [
        str(item["article"].get("title", "")).strip()
        for item in group_articles
        if str(item["article"].get("title", "")).strip()
    ]


def _find_previous_ai_title(previous_clusters: list[dict[str, Any]], article_ids: list[Any]) -> dict[str, Any] | None:
    article_id_set = set(article_ids)
    for cluster in previous_clusters:
        if not cluster.get("titleGenerated"):
            continue
        previous_article_ids = set(cluster.get("articleIds", []))
        if previous_article_ids and previous_article_ids.issubset(article_id_set):
            return cluster
    return None


# Cluster
def cluster_articles() -> ClusterRunResult:
    database = get_database()
    articles_collection = database["articles"]
    clusters_collection = database["clusters"]
    previous_clusters = list(
        clusters_collection.find(
            {},
            {
                "clusterId": 1,
                "label": 1,
                "articleIds": 1,
                "titleGenerated": 1,
                "titleGeneratedAt": 1,
            },
        )
    )

    articles = list(
        articles_collection.find(
            {},
            {
                "_id": 1,
                "title": 1,
                "summary": 1,
                "published": 1,
                "source": 1,
            },
        )
    )

    if not articles:
        clusters_collection.delete_many({})
        return ClusterRunResult(clusters=[], total_articles=0)

    article_keywords: list[tuple[dict[str, Any], set[str]]] = []
    for article in articles:
        article_keywords.append((article, _build_keywords(article)))

    parent: dict[Any, Any] = {}

    def find(item: Any) -> Any:
        parent.setdefault(item, item)
        if parent[item] != item:
            parent[item] = find(parent[item])
        return parent[item]

    def union(left: Any, right: Any) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    # Keep the core clustering rule unchanged: pairwise overlap of at least 3 keywords.
    for index, (article, keywords) in enumerate(article_keywords):
        parent[article["_id"]] = article["_id"]
        for other_index in range(index + 1, len(article_keywords)):
            other_article, other_keywords = article_keywords[other_index]
            if len(keywords.intersection(other_keywords)) >= 3:
                union(article["_id"], other_article["_id"])

    cluster_groups: dict[Any, list[dict[str, Any]]] = {}
    for article, keywords in article_keywords:
        root = find(article["_id"])
        cluster_groups.setdefault(root, []).append({"article": article, "keywords": keywords})

    clusters_collection.delete_many({})

    cluster_documents = []
    article_updates: list[tuple[Any, str]] = []
    cluster_summaries: list[ClusterSummary] = []
    cluster_id_iter = count(1)

    for group_articles in cluster_groups.values():
        cluster_id = f"cluster-{next(cluster_id_iter)}"
        all_keywords = Counter()
        article_ids = []
        sources: list[str] = []

        for item in group_articles:
            article = item["article"]
            all_keywords.update(item["keywords"])
            article_ids.append(article["_id"])

            source = str(article.get("source", "")).strip()
            if source and source not in sources:
                sources.append(source)

        label = _build_cluster_label(group_articles)
        keywords = [keyword for keyword, _ in all_keywords.most_common()]
        start_time, end_time = _collect_cluster_time_bounds(group_articles)
        title_generated = False
        title_generated_at = None

        previous_cluster = _find_previous_ai_title(previous_clusters, article_ids)
        if previous_cluster is not None:
            label = str(previous_cluster.get("label", label)).strip() or label
            title_generated = bool(previous_cluster.get("titleGenerated"))
            title_generated_at = previous_cluster.get("titleGeneratedAt")

        if len(article_ids) >= 2 and not title_generated:
            headlines = _get_headlines(group_articles)[:3]
            if len(headlines) >= 2:
                try:
                    ai_title = generate_title(cluster_id, headlines)
                    if ai_title:
                        label = ai_title
                        title_generated = True
                        title_generated_at = datetime.now(timezone.utc)
                        print(f"[AI] Generated title for cluster {cluster_id}")
                except Exception as exc:  # pragma: no cover - defensive guard
                    logger.error("Unexpected AI title generation failure: %s", exc, exc_info=True)

        cluster_documents.append(
            {
                "_id": cluster_id,
                "clusterId": cluster_id,
                "label": label,
                "keywords": keywords,
                "articleCount": len(article_ids),
                "articleIds": article_ids,
                "sources": sources,
                "startTime": start_time,
                "endTime": end_time,
                "titleGenerated": title_generated,
                "titleGeneratedAt": title_generated_at,
                "createdAt": datetime.now(timezone.utc),
            }
        )

        cluster_summaries.append(
            ClusterSummary(
                cluster_id=cluster_id,
                label=label,
                article_count=len(article_ids),
                title_generated=title_generated,
                sources=sources,
                start_time=start_time,
                end_time=end_time,
            )
        )

        for article_id in article_ids:
            article_updates.append((article_id, cluster_id))

    if cluster_documents:
        clusters_collection.insert_many(cluster_documents)

    for article_id, cluster_id in article_updates:
        articles_collection.update_one({"_id": article_id}, {"$set": {"clusterId": cluster_id}})

    return ClusterRunResult(
        clusters=cluster_summaries,
        total_articles=len(articles),
    )
