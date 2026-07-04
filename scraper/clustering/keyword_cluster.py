from __future__ import annotations

import re
from collections import Counter
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


def _build_keywords(article: dict[str, Any]) -> set[str]:
    text = f"{article.get('title', '')} {article.get('summary', '')}".lower()
    tokens = WORD_RE.findall(text)
    return {token for token in tokens if token not in STOP_WORDS}


def _generate_label(keyword_counts: Counter[str]) -> str:
    top_keywords = [keyword for keyword, _ in keyword_counts.most_common(3)]
    return " ".join(top_keywords) if top_keywords else "general"


def cluster_articles() -> int:
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
                "clusterId": 1,
            },
        )
    )

    if not articles:
        return 0

    article_keywords: list[tuple[dict[str, Any], set[str]]] = []
    for article in articles:
        keywords = _build_keywords(article)
        article_keywords.append((article, keywords))

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

    for index, (article, keywords) in enumerate(article_keywords):
        parent[article["_id"]] = article["_id"]
        for other_index in range(index + 1, len(article_keywords)):
            other_article, other_keywords = article_keywords[other_index]
            if len(keywords.intersection(other_keywords)) >= 3:
                union(article["_id"], other_article["_id"])

    cluster_groups: dict[Any, list[dict[str, Any]]] = {}
    for article, keywords in article_keywords:
        root = find(article["_id"])
        cluster_groups.setdefault(root, []).append(
            {
                "_id": article["_id"],
                "keywords": keywords,
            }
        )

    if not cluster_groups:
        return 0

    clusters_collection.delete_many({})

    inserted_clusters = 0
    cluster_id_iter = count(1)
    cluster_documents = []
    article_updates: list[tuple[Any, str]] = []

    for group_articles in cluster_groups.values():
        cluster_id = f"cluster-{next(cluster_id_iter)}"
        all_keywords = Counter()
        article_ids = []
        for item in group_articles:
            all_keywords.update(item["keywords"])
            article_ids.append(item["_id"])

        label = _generate_label(all_keywords)
        cluster_documents.append(
            {
                "clusterId": cluster_id,
                "label": label,
                "keywords": list(all_keywords.keys()),
                "articleCount": len(article_ids),
            }
        )

        for article_id in article_ids:
            article_updates.append((article_id, cluster_id))

    if cluster_documents:
        clusters_collection.insert_many(cluster_documents)
        inserted_clusters = len(cluster_documents)

    for article_id, cluster_id in article_updates:
        articles_collection.update_one({"_id": article_id}, {"$set": {"clusterId": cluster_id}})

    return inserted_clusters
