from __future__ import annotations

from typing import Any

import requests
import trafilatura


# Extract
def extract_article_content(article: dict[str, Any]) -> dict[str, Any]:
    url = str(article.get("link", "")).strip()
    updated_article = dict(article)

    if not url:
        print(f"Warning: missing article link for '{article.get('title', '')}'")
        updated_article["content"] = ""
        return updated_article

    try:
        response = requests.get(url)
        response.raise_for_status()
        downloaded_html = response.text
        extracted_content = trafilatura.extract(downloaded_html, include_comments=False, include_tables=False)
        content = extracted_content or ""
        updated_article["content"] = content.strip()
    except Exception as exc:
        print(f"Warning: failed to extract content for '{article.get('title', '')}': {exc}")
        updated_article["content"] = ""

    return updated_article
