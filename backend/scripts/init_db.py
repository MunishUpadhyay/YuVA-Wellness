"""
Database initialization script for YuVA Wellness
Ensures all tables exist in the Neon PostgreSQL database.
"""
import sys
import os
import asyncio
import logging

# Add the current directory to sys.path so we can import from app
sys.path.insert(0, os.getcwd())

from app.db.session import engine
from app.db.base_class import Base
from app.db.models.user import User
from app.db.models.otp import OTP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    try:
        logger.info("Connecting to Neon database...")
        async with engine.begin() as conn:
            # This is the standard SQLAlchemy way to create tables
            # It will NOT delete existing data, only create missing tables
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("✅ Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(init_db())
