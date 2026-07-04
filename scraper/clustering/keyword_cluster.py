from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from itertools import count
from typing import Any

from database.mongo import get_database


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

WORD_RE = re.compile(r"[a-z0-9]+")


@dataclass(frozen=True, slots=True)
class ClusterSummary:
    cluster_id: str
    label: str
    article_count: int
    sources: list[str]
    start_time: datetime | None
    end_time: datetime | None


@dataclass(frozen=True, slots=True)
class ClusterRunResult:
    clusters: list[ClusterSummary]
    total_articles: int


def _build_keywords(article: dict[str, Any]) -> set[str]:
    text = f"{article.get('title', '')} {article.get('summary', '')}".lower()
    tokens = WORD_RE.findall(text)
    return {token for token in tokens if token not in STOP_WORDS}


def _parse_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if not value:
        return None
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
    return None


def _format_label(keyword_counts: Counter[str]) -> str:
    # Prefer the most frequent meaningful keywords and keep the label human-readable.
    selected_keywords: list[str] = []
    for keyword, _ in keyword_counts.most_common():
        if keyword not in selected_keywords:
            selected_keywords.append(keyword)
        if len(selected_keywords) == 3:
            break

    return " ".join(word.capitalize() for word in selected_keywords) if selected_keywords else "General"


def _format_cluster_date(value: datetime | None) -> datetime | None:
    return value


def cluster_articles() -> ClusterRunResult:
    database = get_database()
    articles_collection = database["articles"]
    clusters_collection = database["clusters"]

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
        start_times: list[datetime] = []
        end_times: list[datetime] = []

        for item in group_articles:
            article = item["article"]
            all_keywords.update(item["keywords"])
            article_ids.append(article["_id"])

            source = str(article.get("source", "")).strip()
            if source and source not in sources:
                sources.append(source)

            published_at = _parse_datetime(article.get("published"))
            if published_at is not None:
                start_times.append(published_at)
                end_times.append(published_at)

        label = _format_label(all_keywords)
        keywords = [keyword for keyword, _ in all_keywords.most_common()]
        start_time = min(start_times) if start_times else None
        end_time = max(end_times) if end_times else None

        cluster_documents.append(
            {
                "_id": cluster_id,
                "clusterId": cluster_id,
                "label": label,
                "keywords": keywords,
                "articleCount": len(article_ids),
                "articleIds": article_ids,
                "sources": sources,
                "startTime": _format_cluster_date(start_time),
                "endTime": _format_cluster_date(end_time),
                "createdAt": datetime.now(timezone.utc),
            }
        )

        cluster_summaries.append(
            ClusterSummary(
                cluster_id=cluster_id,
                label=label,
                article_count=len(article_ids),
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
