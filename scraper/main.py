from __future__ import annotations

from clustering.keyword_cluster import cluster_articles
from database.article_repository import save_articles
from feeds.extractor import extract_article_content
from feeds.rss_reader import get_articles


# Date
def _format_cluster_date(value):
    return value.strftime("%Y-%m-%d") if value is not None else ""


def main() -> None:
    print("News Pulse Scraper Started")
    # Fetch
    articles = get_articles()
    # Extract
    extracted_articles = [extract_article_content(article) for article in articles]
    # Store
    inserted_count, skipped_count = save_articles(extracted_articles)
    # Cluster
    cluster_run = cluster_articles()

    print("==================================")
    print("Cluster Summary")
    print("==================================")
    print()

    # Report
    for cluster in cluster_run.clusters:
        print(cluster.label)
        print(f"Articles : {cluster.article_count}")
        print(f"Sources  : {', '.join(cluster.sources) if cluster.sources else ''}")
        start_time = _format_cluster_date(cluster.start_time)
        end_time = _format_cluster_date(cluster.end_time)
        if start_time and end_time:
            print(f"Duration : {start_time} \u2192 {end_time}")
        elif start_time:
            print(f"Duration : {start_time}")
        else:
            print("Duration :")
        print()

    total_articles = len(articles)
    print("==================================")
    print(f"Total Articles : {total_articles}")
    print(f"Inserted       : {inserted_count}")
    print(f"Skipped        : {skipped_count}")
    print(f"Clusters       : {len(cluster_run.clusters)}")
    print("==================================")


if __name__ == "__main__":
    main()
