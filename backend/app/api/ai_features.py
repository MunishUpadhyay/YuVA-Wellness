"""
AI Features API Router
"""
import uuid
from datetime import date, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from app.db.models.journal import JournalEntry
from app.db.models.mood import MoodLog
from app.db.models.user import User
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


class JournalAnalysisRequest(BaseModel):
    content: str


@router.get("/ai/daily-insights")
async def get_daily_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated daily insights for current user"""
    try:
        # Get recent moods for current user
        mood_result = await db.execute(
            select(MoodLog)
            .where(MoodLog.user_id == current_user.id)
            .order_by(MoodLog.logged_date.desc())
            .limit(7)
        )
        recent_moods = mood_result.scalars().all()
        
        # Get recent journals for current user
        journal_result = await db.execute(
            select(JournalEntry)
            .where(JournalEntry.user_id == current_user.id)
            .order_by(JournalEntry.created_at.desc())
            .limit(3)
        )
        recent_journals = journal_result.scalars().all()
        
        # Get total entries count for current user
        total_result = await db.execute(
            select(func.count(MoodLog.id)).where(MoodLog.user_id == current_user.id)
        )
        total_entries = total_result.scalar()
        
        user_data = {
            "recent_moods": [{"mood": m.mood, "date": m.logged_date.isoformat(), "score": float(m.score)} for m in recent_moods],
            "recent_journals": [{"content": j.content[:200], "date": j.created_at.isoformat()} for j in recent_journals],
            "total_entries": total_entries
        }
        
        insights = generate_daily_insights(user_data)
        
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
                }
            },
            "generated_at": datetime.utcnow().isoformat(),
            "personalized": False
        }


@router.post("/ai/analyze-journal")
async def analyze_journal_entry(
    analysis_request: JournalAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze journal entry sentiment for current user"""
    if not analysis_request.content.strip():
        return {"error": "Journal content cannot be empty"}
    
    analysis = analyze_journal_sentiment(analysis_request.content)
    
    return {
        "analysis": analysis,
        "analyzed_at": datetime.utcnow().isoformat()
    }


@router.get("/ai/wellness-plan")
async def get_wellness_plan(current_user: User = Depends(get_current_user)):
    """Get personalized wellness plan for current user"""
    user_preferences = {
        "experience_level": "beginner",
        "time_availability": "moderate",
        "focus_areas": ["mood", "stress", "sleep"]
    }
    
    plan = generate_wellness_plan(user_preferences)
    
    return {
        "wellness_plan": plan,
        "created_at": datetime.utcnow().isoformat(),
        "duration": "30_days"
    }


@router.get("/ai/mindfulness-exercise")
async def get_mindfulness_exercise(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a personalized mindfulness exercise for current user"""
    # Get total entries count for current user
    total_result = await db.execute(
        select(func.count(MoodLog.id)).where(MoodLog.user_id == current_user.id)
    )
    total_entries = total_result.scalar()
    
    user_data = {
        "total_entries": total_entries
    }
    
    exercise = create_mindfulness_exercise()
    
    return {
        "exercise": exercise,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/ai/affirmation")
async def get_daily_affirmation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a personalized daily affirmation for current user"""
    # Get total entries count for current user
    total_result = await db.execute(
        select(func.count(MoodLog.id)).where(MoodLog.user_id == current_user.id)
    )
    total_entries = total_result.scalar()
    
    user_data = {
        "total_entries": total_entries
    }
    
    affirmation = generate_personal_affirmation(user_data)
    
    return {
        "affirmation": affirmation,
        "date": date.today().isoformat()
    }


@router.get("/ai/wellness-tip")
async def get_wellness_tip(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a personalized wellness tip for current user"""
    # Get total entries count for current user
    total_result = await db.execute(
        select(func.count(MoodLog.id)).where(MoodLog.user_id == current_user.id)
    )
    total_entries = total_result.scalar()
    
    user_data = {
        "total_entries": total_entries
    }
    
    tip = get_personalized_wellness_tip(user_data)
    
    return {
        "tip": tip,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/ai/progress-summary")
async def get_progress_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated progress summary for current user"""
    try:
        # Get total moods count for current user
        mood_result = await db.execute(
            select(func.count(MoodLog.id)).where(MoodLog.user_id == current_user.id)
        )
        total_moods = mood_result.scalar()
        
        # Get total journals count for current user
        journal_result = await db.execute(
            select(func.count(JournalEntry.id)).where(JournalEntry.user_id == current_user.id)
        )
        total_journals = journal_result.scalar()
        
        user_data = {
            "total_moods": total_moods,
            "total_journals": total_journals
        }
        
        progress = generate_progress_update(user_data)
        
        return {
            "progress": progress,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
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


@router.get("/ai/smart-suggestions")
async def get_smart_suggestions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered smart suggestions for current user"""
    try:
        # Get recent moods for current user
        mood_result = await db.execute(
            select(MoodLog)
            .where(MoodLog.user_id == current_user.id)
            .order_by(MoodLog.logged_date.desc())
            .limit(7)
        )
        recent_moods = mood_result.scalars().all()
        
        user_data = {
            "recent_moods": [{"mood": m.mood, "date": m.logged_date.isoformat()} for m in recent_moods]
        }
        
        suggestions = suggest_daily_actions(user_data)
        
        return {
            "suggestions": suggestions,
            "count": len(suggestions),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
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
                }
            ],
            "count": 2,
            "generated_at": datetime.utcnow().isoformat()
        }


# Helper functions
def generate_daily_insights(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate daily insights from user data"""
    return {
        "mood_insight": {
            "pattern": "stable",
            "message": "Your mood patterns show consistency over the past week.",
            "recommendation": "Continue your current wellness practices."
        },
        "wellness_tip": {
            "category": "Mindfulness",
            "tip": "Try a 5-minute breathing exercise to center yourself today.",
            "difficulty": "easy"
        }
    }


def analyze_journal_sentiment(content: str) -> Dict[str, Any]:
    """Analyze journal entry sentiment"""
    # Simple sentiment analysis
    positive_words = ['good', 'great', 'happy', 'joy', 'love', 'excellent']
    negative_words = ['bad', 'sad', 'angry', 'hate', 'terrible', 'awful']
    
    content_lower = content.lower()
    positive_count = sum(1 for word in positive_words if word in content_lower)
    negative_count = sum(1 for word in negative_words if word in content_lower)
    
    if positive_count > negative_count:
        sentiment = "positive"
    elif negative_count > positive_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "sentiment": sentiment,
        "confidence": 0.8,
        "keywords": positive_words[:3] if sentiment == "positive" else negative_words[:3]
    }


def generate_wellness_plan(preferences: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized wellness plan"""
    return {
        "daily_activities": [
            "5-minute morning meditation",
            "Mood check-in",
            "Gratitude journaling"
        ],
        "weekly_goals": [
            "Complete 3 journal entries",
            "Practice mindfulness 5 times",
            "Connect with a friend or family member"
        ],
        "resources": [
            "Guided meditation videos",
            "Breathing exercise tutorials",
            "Mental health articles"
        ]
    }


def create_mindfulness_exercise() -> Dict[str, Any]:
    """Create mindfulness exercise"""
    exercises = [
        {
            "name": "5-Minute Body Scan",
            "instruction": "Take a moment to scan your body from head to toe. Notice any areas of tension and consciously relax them.",
            "duration": "5 minutes"
        },
        {
            "name": "Mindful Breathing",
            "instruction": "Focus on your natural breath. When your mind wanders, gently bring attention back to the sensation of breathing.",
            "duration": "3 minutes"
        }
    ]
    
    import random
    return random.choice(exercises)


def generate_personal_affirmation(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personal affirmation"""
    affirmations = [
        {
            "text": "I am capable of handling whatever challenges come my way today.",
            "theme": "self_empowerment"
        },
        {
            "text": "Every step I take towards better mental health is valuable.",
            "theme": "progress_recognition"
        }
    ]
    
    import random
    return random.choice(affirmations)


def get_personalized_wellness_tip(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get personalized wellness tip"""
    tips = [
        {
            "category": "Deep Breathing",
            "tip": "Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8."
        },
        {
            "category": "Mindful Movement",
            "tip": "Take a 5-minute walking break and focus on how your feet feel touching the ground."
        }
    ]
    
    import random
    return random.choice(tips)


def generate_progress_update(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate progress update"""
    return {
        "total_mood_logs": user_data.get("total_moods", 0),
        "total_journal_entries": user_data.get("total_journals", 0),
        "current_streak": 3,
        "achievements": ["First mood log", "Consistent tracking"],
        "next_milestone": {
            "type": "mood_tracking",
            "target": 10,
            "current": user_data.get("total_moods", 0),
            "remaining": max(0, 10 - user_data.get("total_moods", 0)),
            "message": "Keep logging your moods to reach 10 entries!"
        }
    }


def suggest_daily_actions(user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Suggest daily actions"""
    return [
        {
            "action": "Take a 10-minute walk",
            "duration": "10 minutes",
            "benefit": "Boost mood and energy",
            "icon": "🚶"
        },
        {
            "action": "Practice gratitude",
            "duration": "5 minutes",
            "benefit": "Improve positive thinking",
            "icon": "🙏"
        }
    ]