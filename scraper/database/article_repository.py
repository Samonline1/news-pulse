from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from database.mongo import get_database


def save_articles(articles: list[dict[str, Any]]) -> int:
    if not articles:
        return 0

    database = get_database()
    collection = database["articles"]

    documents = []
    for article in articles:
        document = dict(article)
        document["createdAt"] = datetime.now(timezone.utc)
        documents.append(document)

    result = collection.insert_many(documents)
    return len(result.inserted_ids)
