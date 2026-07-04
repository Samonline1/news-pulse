from __future__ import annotations

from config import settings


def main() -> None:
    print("News Pulse Scraper Started")
    if settings.mongodb_uri:
        print("MongoDB URI configured")
    else:
        print("MongoDB URI not configured")


if __name__ == "__main__":
    main()
