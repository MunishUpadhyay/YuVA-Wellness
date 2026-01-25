from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from .models.db import init_db, JournalEntry, MoodLog, get_session
from .routers import chat, journal, resources, analytics, ai_features
from .middleware import ErrorHandlingMiddleware, LoggingMiddleware
from pydantic import BaseModel
from typing import List
from datetime import date


app = FastAPI(
    title="YuVA Wellness", 
    version="0.2.0",
    description="AI-powered mental wellness companion",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(LoggingMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/components", StaticFiles(directory="app/components"), name="components")
templates = Jinja2Templates(directory="app/templates")

# Include routers
app.include_router(chat.router)
app.include_router(journal.router)
app.include_router(resources.router)
app.include_router(analytics.router)
app.include_router(ai_features.router)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": "0.2.0",
        "service": "YuVA Wellness API"
    }


@app.get("/api/status")
async def api_status():
    """API status with database connectivity check"""
    try:
        with get_session() as session:
            # Test database connection
            from sqlalchemy import text
            session.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "api": "online",
        "database": db_status,
        "version": "0.2.0",
        "features": {
            "chat": True,
            "journal": True,
            "mood_tracking": True,
            "analytics": True
        }
    }

# Pydantic models
class MoodLogRequest(BaseModel):
    mood: str
    note: str = ""

class JournalEntryRequest(BaseModel):
    title: str = ""
    content: str
    entry_date: date


@app.on_event("startup")
async def on_startup():
    init_db()


