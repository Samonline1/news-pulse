from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True, slots=True)
class Settings:
    mongodb_uri: str | None = None
    environment: str = "development"


settings = Settings(
    mongodb_uri=os.getenv("MONGODB_URI") or None,
    environment=os.getenv("ENVIRONMENT", "development"),
)
