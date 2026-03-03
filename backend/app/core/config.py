"""
Configuration settings for YuVA Wellness API
"""
from functools import lru_cache
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
    # SMTP Configuration
    # --------------------
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "your-email@gmail.com"
    smtp_password: str = "your-app-password"

    # --------------------
    # CORS Configuration
    # --------------------
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.pages.dev"
    ]

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
