from __future__ import annotations

import json
import os
from dataclasses import dataclass, field

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True, slots=True)
class Settings:
    mongo_uri: str | None = None
    environment: str = "development"
    rss_feeds: list[dict[str, str]] = field(default_factory=list)


def _parse_rss_feeds(raw_value: str | None) -> list[dict[str, str]]:
    if not raw_value:
        return []

    raw_value = raw_value.strip()

    try:
        parsed = json.loads(raw_value)
        if isinstance(parsed, list):
            feeds: list[dict[str, str]] = []
            for item in parsed:
                if not isinstance(item, dict):
                    continue
                source = str(item.get("source", "")).strip()
                url = str(item.get("url", "")).strip()
                if source and url:
                    feeds.append({"source": source, "url": url})
            if feeds:
                return feeds
    except json.JSONDecodeError:
        pass

    feeds = []
    for item in raw_value.split(","):
        chunk = item.strip()
        if not chunk:
            continue
        if "|" in chunk:
            source, url = chunk.split("|", 1)
            source = source.strip()
            url = url.strip()
        else:
            source = "Feed"
            url = chunk
        if source and url:
            feeds.append({"source": source, "url": url})

    return feeds


settings = Settings(
    mongo_uri=os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or None,
    environment=os.getenv("ENVIRONMENT", "development"),
    rss_feeds=_parse_rss_feeds(os.getenv("RSS_FEEDS")),
)
