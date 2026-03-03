"""
Database package initialization
"""
from .session import get_engine, get_async_session_local, get_db
from .base_class import Base, metadata

# Backward compatibility aliases
engine = get_engine
AsyncSessionLocal = get_async_session_local

__all__ = [
    "engine",
    "AsyncSessionLocal", 
    "get_db",
    "Base",
    "metadata",
    "get_engine",
    "get_async_session_local"
]