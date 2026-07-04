from __future__ import annotations

from feeds.extractor import extract_article_content
from feeds.rss_reader import get_articles


def main() -> None:
    print("News Pulse Scraper Started")
    articles = get_articles()
    print(f"Total articles: {len(articles)}")
    for article in articles[:3]:
        extracted_article = extract_article_content(article)
        print(f"Title: {extracted_article['title']}")
        print(f"Content length: {len(extracted_article['content'])}")
        print(f"Content preview: {extracted_article['content'][:300]}")


if __name__ == "__main__":
    main()


