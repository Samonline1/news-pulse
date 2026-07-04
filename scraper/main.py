from __future__ import annotations

from feeds.rss_reader import get_articles


def main() -> None:
    print("News Pulse Scraper Started")
    articles = get_articles()
    print(f"Total articles: {len(articles)}")
    if articles:
        print("Sample article:")
        print(articles[0])
    for article in articles[:5]:
        print(article["title"])


if __name__ == "__main__":
    main()



