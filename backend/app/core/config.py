"""
Configuration settings for YuVA Wellness API
"""
from functools import lru_cache
from pydantic import validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --------------------
    # App Configuration
    # --------------------
    app_name: str = "YuVA Wellness API"
    environment: str = "development"
    debug: bool = False

    # --------------------
    # Database Configuration
    # --------------------
    database_url: str

    # --------------------
    # Security Configuration
    # --------------------
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # --------------------
    # Authentication Configuration
    # --------------------
    google_client_id: str = "your-google-client-id.apps.googleusercontent.com"
    mail_from_name: str = "YuVA Wellness"
    mail_from_address: str = "noreply@yuva-wellness.com"

    # --------------------
    # CORS Configuration
    # --------------------
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "https://yuva-wellness.vercel.app",
        "https://yuva-wellness-gzhr.onrender.com"
    ]
    # Regex to match any vercel/netlify app subdomains
    allow_origin_regex: str = r"https://.*\.vercel\.app|https://.*\.render\.com|https://.*\.netlify\.app"

    @validator("allowed_origins", pre=True)
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    # --------------------
    # Gemini / Google Cloud Configuration
    # --------------------
    gcp_project: str | None = None
    gcp_location: str = "us-central1"
    vertex_model: str = "gemini-2.5-flash"
    gemini_api_key: str | None = None

    # --------------------
    # Pydantic Settings Configuration
    # --------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        env_prefix=""
    )

    @property
    def is_development(self) -> bool:
        return self.environment == "development"
    
    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
