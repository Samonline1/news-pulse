from __future__ import annotations

from typing import Any

import feedparser


RSS_FEEDS: tuple[tuple[str, str], ...] = (
    ("BBC", "https://feeds.bbci.co.uk/news/rss.xml"),
    ("NPR", "https://feeds.npr.org/1001/rss.xml"),
    ("Reuters", "https://feeds.reuters.com/reuters/topNews"),
)


def _clean_value(entry: Any, key: str) -> str:
    value = entry.get(key, "") if hasattr(entry, "get") else ""
    if value is None:
        return ""
    return str(value).strip()


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
            }
        )

    return articles


def get_articles() -> list[dict[str, str]]:
    articles: list[dict[str, str]] = []
    for source, url in RSS_FEEDS:
        articles.extend(_parse_feed(source, url))
    return articles
