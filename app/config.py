import os
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "YuVA Wellness"
    environment: str = Field(default=os.getenv("ENVIRONMENT", "development"))

    # Vertex AI
    gcp_project: str | None = Field(default=os.getenv("GCP_PROJECT"))
    gcp_location: str = Field(default=os.getenv("GCP_LOCATION", "us-central1"))
    vertex_model: str = Field(default=os.getenv("VERTEX_MODEL", "gemini-1.5-flash-002"))

    # Privacy
    analytics_enabled: bool = Field(default=bool(int(os.getenv("ANALYTICS_ENABLED", "0"))))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


