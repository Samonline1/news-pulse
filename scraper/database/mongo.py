from __future__ import annotations

from functools import lru_cache

from pymongo import MongoClient

from config import settings


@lru_cache(maxsize=1)
def get_mongo_client() -> MongoClient:
    if not settings.mongo_uri:
        raise ValueError("MONGO_URI is not configured")
    return MongoClient(settings.mongo_uri)


def get_database():
    client = get_mongo_client()
    database = client.get_default_database()
    if database is None:
        raise ValueError("MongoDB URI must include a default database name")
    return database
