"""
YuVA Wellness - API-Only Backend
FastAPI backend for mental health web application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, journal, analytics, ai_features, mood, resources, ai
from app.api.auth import router as auth_router
from app.middleware import ErrorHandlingMiddleware, LoggingMiddleware
from app.core.config import get_settings

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="YuVA Wellness API", 
    version="1.0.0",
    description="API-only backend for YuVA Wellness mental health platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(LoggingMiddleware)

# Add CORS middleware for static frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(mood.router, prefix="/api")
app.include_router(journal.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(ai_features.router, prefix="/api")
app.include_router(ai.router, prefix="/api/ai")

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "service": "YuVA Wellness API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "ok"}

@app.get("/api/status")
async def api_status():
    """API status with database connectivity check"""
    try:
        from app.db.session import get_db
        from sqlalchemy import text
        
        # Use the dependency to get a session
        async for session in get_db():
            await session.execute(text("SELECT 1"))
            db_status = "connected"
            break
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "api": "online",
        "database": db_status,
        "version": "1.0.0",
        "environment": settings.environment,
        "features": {
            "mood_tracking": True,
            "journal": True,
            "chat": True,
            "analytics": True,
            "ai_features": True
        }
    }

@app.on_event("startup")
async def on_startup():
    """Application startup"""
    # No auto table creation - use migrations instead
    pass