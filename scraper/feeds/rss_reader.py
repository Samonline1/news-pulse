from __future__ import annotations

from typing import Any

import feedparser
from config import settings


# Defaults
DEFAULT_RSS_FEEDS: tuple[tuple[str, str], ...] = (
    ("BBC", "https://feeds.bbci.co.uk/news/rss.xml"),
    ("NPR", "https://feeds.npr.org/1001/rss.xml"),
    ("Reuters", "https://feeds.reuters.com/reuters/topNews"),
)


# Clean
def _clean_value(entry: Any, key: str) -> str:
    value = entry.get(key, "") if hasattr(entry, "get") else ""
    if value is None:
        return ""
    return str(value).strip()


def _extract_categories(entry: Any) -> list[str]:
    categories: list[str] = []
    raw_tags = getattr(entry, "tags", None) or entry.get("tags", []) if hasattr(entry, "get") else []
    for tag in raw_tags or []:
        if isinstance(tag, dict):
            term = str(tag.get("term", "")).strip()
        else:
            term = str(tag).strip()
        if term and term not in categories:
            categories.append(term)

    return categories


# Parse
def _parse_feed(source: str, url: str) -> list[dict[str, str]]:
    print(f"Fetching {source} feed...")

    try:
        parsed_feed = feedparser.parse(url)
    except Exception as exc:
        print(f"Failed to fetch {source} feed: {exc}")
        return []

    if getattr(parsed_feed, "bozo", False):
        bozo_exception = getattr(parsed_feed, "bozo_exception", None)
        if bozo_exception is not None:
            print(f"Warning: {source} feed returned a parse issue: {bozo_exception}")

    articles: list[dict[str, str]] = []
    for entry in getattr(parsed_feed, "entries", []):
        articles.append(
            {
                "title": _clean_value(entry, "title"),
                "link": _clean_value(entry, "link"),
                "published": _clean_value(entry, "published"),
                "summary": _clean_value(entry, "summary"),
                "source": source,
                "categories": _extract_categories(entry),
            }
        )

    return articles


# Collect
def get_articles() -> list[dict[str, str]]:
    articles: list[dict[str, str]] = []
    configured_feeds = settings.rss_feeds or [
        {"source": source, "url": url} for source, url in DEFAULT_RSS_FEEDS
    ]

    for feed in configured_feeds:
        source = str(feed.get("source", "")).strip()
        url = str(feed.get("url", "")).strip()
        if not source or not url:
            continue
        articles.extend(_parse_feed(source, url))
    return articles
