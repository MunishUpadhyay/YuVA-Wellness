"""
Database session configuration for PostgreSQL (Neon) with async SQLAlchemy
"""
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

# Global variables for lazy initialization
_engine: Optional[AsyncEngine] = None
_async_session_local: Optional[async_sessionmaker] = None

def get_database_url() -> str:
    """Get DATABASE_URL from settings with validation"""
    settings = get_settings()
    DATABASE_URL = settings.database_url
    
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required")
    
    # Ensure the URL uses asyncpg driver
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif not DATABASE_URL.startswith("postgresql+asyncpg://"):
        raise ValueError("DATABASE_URL must use postgresql:// or postgresql+asyncpg:// scheme")
    
    # Fix SSL parameter for asyncpg (ssl=true -> ssl=require)
    if "ssl=true" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("ssl=true", "ssl=require")
    
    return DATABASE_URL

def get_engine() -> AsyncEngine:
    """Get or create the async engine"""
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            get_database_url(),
            echo=False,
            pool_pre_ping=True,  # Required
            poolclass=NullPool,  # Required for Neon
            future=True,
        )
    return _engine

def get_async_session_local() -> async_sessionmaker:
    """Get or create the async session maker"""
    global _async_session_local
    if _async_session_local is None:
        _async_session_local = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _async_session_local

# Module-level variables that call the functions
engine = get_engine()
AsyncSessionLocal = get_async_session_local()

# FastAPI async dependency
async def get_db() -> AsyncSession:
    """
    Async dependency for FastAPI to get database session
    """
    session_local = get_async_session_local()
    async with session_local() as session:
        try:
            yield session
        finally:
            await session.close()