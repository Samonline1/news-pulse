from __future__ import annotations

import logging
from typing import Iterable

import requests

from config import settings


logger = logging.getLogger(__name__)


def _normalize_title(text: str) -> str:
    title = " ".join(text.split()).strip()
    title = title.strip('"').strip("'").strip()
    if not title:
        return ""

    words = title.split()
    if len(words) > 8:
        title = " ".join(words[:8])

    return title


def _build_title_prompt(headlines: Iterable[str]) -> str:
    joined_headlines = "\n".join(f"- {headline.strip()}" for headline in headlines if headline.strip())
    return (
        "Generate a concise news topic title from these article headlines.\n"
        "Requirements:\n"
        "- Maximum 8 words\n"
        "- Professional news headline\n"
        "- Return ONLY the title\n"
        "- No quotation marks\n"
        "- No numbering\n"
        "- No explanation\n\n"
        f"Headlines:\n{joined_headlines}"
    )


def generate_title(cluster_id, headlines):
    """
    Generate a concise cluster title from the first 2-3 article headlines.
    """
    if not settings.groq_api_key:
        print("[AI] GROQ_API_KEY not found. Using keyword-generated labels.")
        return None

    cleaned_headlines = [headline.strip() for headline in headlines if isinstance(headline, str) and headline.strip()]
    if not cleaned_headlines:
        return None

    model = settings.groq_model.strip() if settings.groq_model else ""
    if not model or model == "placeholder":
        model = "llama-3.3-70b-versatile"

    prompt = _build_title_prompt(cleaned_headlines[:3])

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "temperature": settings.ai_temperature,
                "max_tokens": settings.max_tokens or 24,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            },
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json()
        content = (
            payload.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        title = _normalize_title(str(content))
        return title or None
    except (requests.RequestException, ValueError, KeyError, IndexError) as exc:
        print(f"[AI] Failed to generate title for cluster {cluster_id}")
        print(f"Reason: {exc}")
        logger.error("Failed to generate cluster title with Groq for cluster %s: %s", cluster_id, exc, exc_info=True)
        return None


def generate_summary(cluster_articles):
    """
    Placeholder for future AI-generated cluster summaries.
    Currently returns None.
    """
    return None
