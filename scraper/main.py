from __future__ import annotations

from database.article_repository import save_articles
from feeds.extractor import extract_article_content
from feeds.rss_reader import get_articles


def main() -> None:
    print("News Pulse Scraper Started")
    articles = get_articles()
    print(f"Total articles: {len(articles)}")
    extracted_articles = [extract_article_content(article) for article in articles[:3]]
    inserted_count = save_articles(extracted_articles)
    print(f"Inserted {inserted_count} articles into MongoDB")


if __name__ == "__main__":
    main()

