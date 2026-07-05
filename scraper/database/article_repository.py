from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from database.mongo import get_database


# Persist
def save_articles(articles: list[dict[str, Any]]) -> tuple[int, int]:
    if not articles:
        return 0, 0

    database = get_database()
    collection = database["articles"]

    inserted_count = 0
    skipped_count = 0

    for article in articles:
        url = str(article.get("link", "")).strip()
        if url and collection.find_one({"link": url}, {"_id": 1}) is not None:
            skipped_count += 1
            continue

        document = dict(article)
        document["link"] = url
        document["createdAt"] = datetime.now(timezone.utc)
        collection.insert_one(document)
        inserted_count += 1

    return inserted_count, skipped_count
