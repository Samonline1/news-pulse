from __future__ import annotations

from functools import lru_cache
import logging

from sentence_transformers import SentenceTransformer


logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    # Load the embedding model once and reuse it for the whole scraper run.
    model = SentenceTransformer(MODEL_NAME)
    print("[Embedding] Model loaded")
    logger.info("Embedding model loaded: %s", MODEL_NAME)
    return model


def build_article_embedding(text: str):
    # Generate a semantic embedding for the article text used in clustering.
    model = get_embedding_model()
    return model.encode(text, convert_to_tensor=True, normalize_embeddings=True)
