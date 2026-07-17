from __future__ import annotations

import logging
import re
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from itertools import count
from typing import Any

from sentence_transformers import util

from clustering.embedding_model import build_article_embedding, get_embedding_model
from config import EMBEDDING_SIMILARITY_THRESHOLD
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
    summary_status: str
    sources: list[str]
    start_time: datetime | None
    end_time: datetime | None


@dataclass(frozen=True, slots=True)
class ClusterRunResult:
    clusters: list[ClusterSummary]
    total_articles: int


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


def _build_article_text(article: dict[str, Any]) -> str:
    title = str(article.get("title", "")).strip()
    summary = str(article.get("summary", "")).strip()
    content = str(article.get("content", "")).strip()
    return " ".join(part for part in [title, summary, content] if part)


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


def _collect_cluster_time_bounds(group_articles: list[dict[str, Any]]) -> tuple[datetime | None, datetime | None]:
    published_times: list[datetime] = []

    for item in group_articles:
        published_at = _parse_datetime(item["article"].get("published"))
        if published_at is not None:
            published_times.append(published_at)

    if not published_times:
        return None, None

    return min(published_times), max(published_times)


def _collect_last_article_updated_at(group_articles: list[dict[str, Any]]) -> datetime | None:
    updated_times: list[datetime] = []

    for item in group_articles:
        article = item["article"]
        created_at = article.get("createdAt")
        if isinstance(created_at, datetime):
            updated_times.append(created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc))

    if not updated_times:
        return None

    return max(updated_times)


def _get_headlines(group_articles: list[dict[str, Any]]) -> list[str]:
    return [
        str(item["article"].get("title", "")).strip()
        for item in group_articles
        if str(item["article"].get("title", "")).strip()
    ]


def _collect_unique_text_values(group_articles: list[dict[str, Any]], key: str) -> list[str]:
    values: list[str] = []
    seen: set[str] = set()

    for item in group_articles:
        raw_value = item["article"].get(key)
        if not raw_value:
            continue

        if isinstance(raw_value, str):
            candidates = [raw_value]
        elif isinstance(raw_value, list):
            candidates = [str(value).strip() for value in raw_value]
        else:
            candidates = [str(raw_value).strip()]

        for candidate in candidates:
            candidate = candidate.strip()
            if not candidate or candidate in seen:
                continue
            seen.add(candidate)
            values.append(candidate)

    return values


def _collect_first_text_value(group_articles: list[dict[str, Any]], key: str) -> str:
    for item in group_articles:
        raw_value = item["article"].get(key)
        if isinstance(raw_value, str):
            value = raw_value.strip()
            if value:
                return value
        elif raw_value:
            value = str(raw_value).strip()
            if value:
                return value
    return ""


def _find_previous_ai_title(previous_clusters: list[dict[str, Any]], article_ids: list[Any]) -> dict[str, Any] | None:
    article_id_set = set(article_ids)
    for cluster in previous_clusters:
        if not cluster.get("titleGenerated"):
            continue
        previous_article_ids = set(cluster.get("articleIds", []))
        if previous_article_ids and previous_article_ids.issubset(article_id_set):
            return cluster
    return None


def _find_previous_cluster(previous_clusters: list[dict[str, Any]], article_ids: list[Any]) -> dict[str, Any] | None:
    article_id_set = set(article_ids)
    best_match: dict[str, Any] | None = None
    best_match_size = -1
    for cluster in previous_clusters:
        previous_article_ids = set(cluster.get("articleIds", []))
        if previous_article_ids and previous_article_ids.issubset(article_id_set):
            if len(previous_article_ids) > best_match_size:
                best_match = cluster
                best_match_size = len(previous_article_ids)
    return best_match


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
                "authors": 1,
                "categories": 1,
                "image": 1,
                "createdAt": 1,
            },
        )
    )

    if not articles:
        clusters_collection.delete_many({})
        return ClusterRunResult(clusters=[], total_articles=0)

    # Load the embedding model once when clustering starts.
    get_embedding_model()

    article_embeddings: list[tuple[dict[str, Any], Any | None]] = []
    for article in articles:
        article_text = _build_article_text(article)
        if not article_text:
            logger.warning("Skipping embedding generation for article %s due to empty text", article.get("_id"))
            article_embeddings.append((article, None))
            continue

        try:
            # Generate one semantic embedding per article for cosine similarity matching.
            embedding = build_article_embedding(article_text)
            article_embeddings.append((article, embedding))
        except Exception as exc:  # pragma: no cover - defensive guard
            logger.error("Failed to generate embedding for article %s: %s", article.get("_id"), exc, exc_info=True)
            article_embeddings.append((article, None))

    cluster_states: list[dict[str, Any]] = []
    cluster_groups: dict[str, list[dict[str, Any]]] = {}

    for article, embedding in article_embeddings:
        article_id = article["_id"]
        article_title = str(article.get("title", "")).strip() or "<untitled>"
        compared_count = 0
        best_similarity = -1.0
        best_cluster_id: str | None = None

        if embedding is not None and cluster_states:
            for cluster_state in cluster_states:
                representative_embedding = cluster_state["representative_embedding"]
                if representative_embedding is None:
                    continue

                compared_count += 1
                # Cosine similarity measures how close two semantic embeddings are.
                similarity = float(util.cos_sim(embedding, representative_embedding).item())
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_cluster_id = cluster_state["cluster_id"]

        decision = "Created new cluster"
        assigned_cluster_id = None

        if best_cluster_id is not None and best_similarity >= EMBEDDING_SIMILARITY_THRESHOLD:
            assigned_cluster_id = best_cluster_id
            decision = "Added to existing cluster"
        else:
            assigned_cluster_id = f"cluster-{len(cluster_states) + 1}"
            cluster_states.append(
                {
                    "cluster_id": assigned_cluster_id,
                    "representative_embedding": embedding,
                }
            )
            decision = "Created new cluster"

        cluster_groups.setdefault(assigned_cluster_id, []).append({"article": article, "embedding": embedding})

        print("[Embedding][Debug] Article title:", article_title)
        print("[Embedding][Debug] Compared against:", compared_count)
        print("[Embedding][Debug] Best matching cluster ID:", best_cluster_id)
        print("[Embedding][Debug] Highest cosine similarity:", f"{max(best_similarity, 0.0):.4f}")
        print("[Embedding][Debug] Configured threshold:", f"{EMBEDDING_SIMILARITY_THRESHOLD:.2f}")
        print("[Embedding][Debug] Final decision:", decision)

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
            label_text = _build_article_text(article)
            all_keywords.update(_extract_label_words(label_text))
            article_ids.append(article["_id"])

            source = str(article.get("source", "")).strip()
            if source and source not in sources:
                sources.append(source)

        label = _build_cluster_label(group_articles)
        keywords = [keyword for keyword, _ in all_keywords.most_common()]
        categories = _collect_unique_text_values(group_articles, "categories")
        start_time, end_time = _collect_cluster_time_bounds(group_articles)
        title_generated = False
        title_generated_at = None

        previous_cluster = _find_previous_ai_title(previous_clusters, article_ids)
        previous_cluster_doc = _find_previous_cluster(previous_clusters, article_ids)
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

        last_article_updated_at = _collect_last_article_updated_at(group_articles)
        summary_status = "idle"
        summary = ""
        summary_generated_at = None
        summary_article_count = 0

        if previous_cluster_doc is not None:
            summary = str(previous_cluster_doc.get("summary", "")).strip()
            summary_status = str(previous_cluster_doc.get("summaryStatus", "idle")).strip() or "idle"
            summary_generated_at = previous_cluster_doc.get("summaryGeneratedAt")
            summary_article_count = int(previous_cluster_doc.get("summaryArticleCount") or 0)
            previous_last_updated = previous_cluster_doc.get("lastArticleUpdatedAt")
            if (
                summary
                and summary_generated_at is not None
                and last_article_updated_at is not None
                and previous_last_updated is not None
                and last_article_updated_at > summary_generated_at
            ):
                summary_status = "stale"

        cluster_documents.append(
            {
                "_id": cluster_id,
                "clusterId": cluster_id,
                "label": label,
                "keywords": keywords,
                "articleCount": len(article_ids),
                "articleIds": article_ids,
                "sources": sources,
                "categories": categories,
                "startTime": start_time,
                "endTime": end_time,
                "lastArticleUpdatedAt": last_article_updated_at,
                "titleGenerated": title_generated,
                "titleGeneratedAt": title_generated_at,
                "summary": summary,
                "summaryStatus": summary_status,
                "summaryGeneratedAt": summary_generated_at,
                "summaryArticleCount": summary_article_count,
                "lastArticleUpdatedAt": last_article_updated_at,
                "createdAt": datetime.now(timezone.utc),
            }
        )

        cluster_summaries.append(
            ClusterSummary(
                cluster_id=cluster_id,
                label=label,
                article_count=len(article_ids),
                title_generated=title_generated,
                summary_status=summary_status,
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
