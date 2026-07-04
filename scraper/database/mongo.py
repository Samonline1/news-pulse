from __future__ import annotations

from functools import lru_cache

from pymongo import MongoClient

from config import settings


@lru_cache(maxsize=1)
def get_mongo_client() -> MongoClient:
    if not settings.mongodb_uri:
        raise ValueError("MONGODB_URI is not configured")
    return MongoClient(settings.mongodb_uri)


def get_database():
    client = get_mongo_client()
    database = client.get_default_database()
    if database is None:
        raise ValueError("MongoDB URI must include a default database name")
    return database
