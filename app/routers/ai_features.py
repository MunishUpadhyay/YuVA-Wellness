"""
AI Features Router - Advanced AI Assistant Capabilities
"""
from __future__ import annotations

from datetime import date, datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from ..models.db import get_session, JournalEntry, MoodLog
from ..services.ai_assistant import ai_assistant
from ..security import check_rate_limit, api_limiter

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


class JournalAnalysisRequest(BaseModel):
    content: str


class WellnessPlanRequest(BaseModel):
    preferences: Dict[str, Any] = {}


@router.get("/api/ai/daily-insights")
async def get_daily_insights(request: Request):
    check_rate_limit(request, api_limiter)
    
    try:
        with get_session() as session:
            try:
                recent_moods = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).limit(7).all()
                recent_journals = session.query(JournalEntry).order_by(JournalEntry.created_at.desc()).limit(3).all()
                total_entries = session.query(MoodLog).count()
            except Exception as db_error:
                recent_moods = []
                recent_journals = []
                total_entries = 0
            
            user_data = {
                "recent_moods": [{"mood": m.mood, "date": m.logged_date.isoformat(), "note": m.note} for m in recent_moods],
                "recent_journals": [{"content": j.content[:200], "date": j.created_at.isoformat()} for j in recent_journals],
                "total_entries": total_entries
            }
        
        insights = await ai_assistant.generate_daily_insights(user_data)
        
        return {
            "insights": insights,
            "generated_at": datetime.utcnow().isoformat(),
            "personalized": len(recent_moods) > 0 or len(recent_journals) > 0
        }
    
    except Exception as e:
        return {
            "insights": {
                "mood_insight": {
                    "pattern": "getting_started",
                    "message": "Welcome to YuVA! Start logging your moods to see personalized insights.",
                    "recommendation": "Try logging your mood daily to track patterns and get better insights."
                },
                "wellness_tip": {
                    "category": "Getting Started",
                    "tip": "Take a few deep breaths and set an intention for your wellness journey today.",
                    "difficulty": "easy"
                },
                "progress_update": {
                    "next_milestone": {
                        "message": "Start your wellness journey by logging your first mood or journal entry!"
                    }
                },
                "recommended_actions": [
                    {
                        "action": "Log your current mood",
                        "duration": "1 minute",
                        "benefit": "Start tracking your emotional patterns",
                        "icon": "😊"
                    }
                ],
                "mindfulness_moment": {
                    "name": "Welcome Breathing",
                    "instruction": "Take three deep breaths. Inhale peace, exhale stress.",
                    "duration": "1 minute",
                    "benefit": "Instant calm and presence"
                },
                "affirmation": {
                    "text": "I am taking positive steps toward better mental wellness.",
                    "theme": "self_care"
                }
            },
            "generated_at": datetime.utcnow().isoformat(),
            "personalized": False
        }


@router.post("/api/ai/analyze-journal")
async def analyze_journal_entry(request: Request, analysis_request: JournalAnalysisRequest):
    check_rate_limit(request, api_limiter)
    
    if not analysis_request.content.strip():
        raise HTTPException(status_code=400, detail="Journal content cannot be empty")
    
    analysis = await ai_assistant.analyze_journal_sentiment(analysis_request.content)
    
    return {
        "analysis": analysis,
        "analyzed_at": datetime.utcnow().isoformat()
    }


@router.get("/api/ai/wellness-plan")
async def get_wellness_plan(request: Request):
    check_rate_limit(request, api_limiter)
    
    user_preferences = {
        "experience_level": "beginner",
        "time_availability": "moderate",
        "focus_areas": ["mood", "stress", "sleep"]
    }
    
    plan = await ai_assistant.generate_wellness_plan(user_preferences)
    
    return {
        "wellness_plan": plan,
        "created_at": datetime.utcnow().isoformat(),
        "duration": "30_days"
    }


@router.get("/api/ai/conversation-starters")
async def get_conversation_starters(request: Request):
    """Get AI-generated conversation starters for chat"""
    check_rate_limit(request, api_limiter)
    
    starters = ai_assistant.get_conversation_starters()
    
    return {
        "conversation_starters": starters,
        "count": len(starters)
    }


@router.get("/api/ai/mindfulness-exercise")
async def get_mindfulness_exercise(request: Request):
    """Get a personalized mindfulness exercise"""
    check_rate_limit(request, api_limiter)
    
    # Get user data for personalization
    with get_session() as session:
        user_data = {
            "total_entries": session.query(MoodLog).count()
        }
    
    exercise = ai_assistant._create_mindfulness_exercise()
    
    return {
        "exercise": exercise,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/api/ai/affirmation")
async def get_daily_affirmation(request: Request):
    """Get a personalized daily affirmation"""
    check_rate_limit(request, api_limiter)
    
    with get_session() as session:
        user_data = {
            "total_entries": session.query(MoodLog).count()
        }
    
    affirmation = ai_assistant._generate_personal_affirmation(user_data)
    
    return {
        "affirmation": affirmation,
        "date": date.today().isoformat()
    }


@router.get("/api/ai/wellness-tip")
async def get_wellness_tip(request: Request):
    """Get a personalized wellness tip"""
    check_rate_limit(request, api_limiter)
    
    with get_session() as session:
        user_data = {
            "total_entries": session.query(MoodLog).count()
        }
    
    tip = ai_assistant._get_personalized_wellness_tip(user_data)
    
    return {
        "tip": tip,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/api/ai/progress-summary")
async def get_progress_summary(request: Request):
    """Get AI-generated progress summary"""
    check_rate_limit(request, api_limiter)
    
    try:
        with get_session() as session:
            try:
                total_moods = session.query(MoodLog).count()
                total_journals = session.query(JournalEntry).count()
            except Exception as db_error:
                print(f"Database error in progress summary: {db_error}")
                total_moods = 0
                total_journals = 0
            
            user_data = {
                "total_moods": total_moods,
                "total_journals": total_journals
            }
        
        progress = ai_assistant._generate_progress_update(user_data)
        
        return {
            "progress": progress,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        print(f"Error in progress summary: {e}")
        # Return fallback progress data
        return {
            "progress": {
                "total_mood_logs": 0,
                "total_journal_entries": 0,
                "current_streak": 0,
                "achievements": [],
                "next_milestone": {
                    "type": "mood_tracking",
                    "target": 1,
                    "current": 0,
                    "remaining": 1,
                    "message": "Log your first mood to start tracking your wellness journey!"
                }
            },
            "generated_at": datetime.utcnow().isoformat()
        }


@router.get("/api/ai/smart-suggestions")
async def get_smart_suggestions(request: Request):
    """Get AI-powered smart suggestions based on user patterns"""
    check_rate_limit(request, api_limiter)
    
    try:
        with get_session() as session:
            try:
                # Analyze recent patterns
                recent_moods = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).limit(7).all()
                user_data = {
                    "recent_moods": [{"mood": m.mood, "date": m.logged_date.isoformat()} for m in recent_moods]
                }
            except Exception as db_error:
                print(f"Database error in smart suggestions: {db_error}")
                user_data = {"recent_moods": []}
        
        suggestions = ai_assistant._suggest_daily_actions(user_data)
        
        return {
            "suggestions": suggestions,
            "count": len(suggestions),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        print(f"Error in smart suggestions: {e}")
        # Return fallback suggestions
        return {
            "suggestions": [
                {
                    "action": "Take 5 deep breaths",
                    "duration": "2 minutes",
                    "benefit": "Reduces stress and centers your mind",
                    "icon": "🫁"
                },
                {
                    "action": "Write one thing you're grateful for",
                    "duration": "3 minutes", 
                    "benefit": "Shifts focus to positive aspects of life",
                    "icon": "🙏"
                },
                {
                    "action": "Step outside for fresh air",
                    "duration": "5 minutes",
                    "benefit": "Natural mood boost and vitamin D",
                    "icon": "🌞"
                }
            ],
            "count": 3,
            "generated_at": datetime.utcnow().isoformat()
        }


@router.get("/dashboard", response_class=HTMLResponse)
async def ai_dashboard(request: Request):
    """AI-powered wellness dashboard"""
    return templates.TemplateResponse("ai_dashboard.html", {"request": request})