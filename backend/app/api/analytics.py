"""
Analytics API Router
"""
import uuid
from datetime import date, datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
import json
import csv
from io import StringIO

from app.db.models.journal import JournalEntry
from app.db.models.mood import MoodLog
from app.db.models.user import User
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


class AnalyticsSummary(BaseModel):
    total_journal_entries: int
    total_mood_logs: int
    recent_journals: int
    recent_moods: int
    activity_streak: int
    last_updated: str


@router.get("/analytics", response_model=AnalyticsSummary)
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics summary for current user"""
    # Get recent entries for current user
    journal_result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.entry_date.desc())
        .limit(30)
    )
    journal_entries = journal_result.scalars().all()
    
    mood_result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.logged_date.desc())
        .limit(30)
    )
    mood_entries = mood_result.scalars().all()
    
    # Calculate statistics
    total_entries = len(journal_entries)
    total_moods = len(mood_entries)
    
    # Recent activity (last 7 days)
    week_ago = date.today() - timedelta(days=7)
    recent_journals = len([e for e in journal_entries if e.entry_date >= week_ago])
    recent_moods = len([m for m in mood_entries if m.logged_date >= week_ago])
    
    return AnalyticsSummary(
        total_journal_entries=total_entries,
        total_mood_logs=total_moods,
        recent_journals=recent_journals,
        recent_moods=recent_moods,
        activity_streak=calculate_streak(mood_entries),
        last_updated=datetime.utcnow().isoformat()
    )


@router.get("/analytics/dashboard")
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard data for current user"""
    # Get journal entries for current user
    journal_result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.entry_date.desc())
        .limit(30)
    )
    journal_entries = journal_result.scalars().all()
    
    # Get mood entries for current user
    mood_result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.logged_date.desc())
        .limit(30)
    )
    mood_entries = mood_result.scalars().all()
    
    # Mood distribution
    mood_counts = {}
    total_score = 0
    count = 0
    mood_scores = {
        'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    }

    for mood in mood_entries:
        mood_counts[mood.mood] = mood_counts.get(mood.mood, 0) + 1
        # Use score from DB if available, else fallback to mapping
        score = float(mood.score) if mood.score else mood_scores.get(mood.mood, 3)
        total_score += score
        count += 1
    
    avg_mood = round(total_score / count, 1) if count > 0 else 0
    wellness_score = round((avg_mood / 5) * 100) if count > 0 else 0
    wellness_category = "Calculating..."
    if wellness_score >= 80: wellness_category = "Excellent"
    elif wellness_score >= 60: wellness_category = "Good"
    elif wellness_score >= 40: wellness_category = "Fair"
    else: wellness_category = "Needs Attention"

    # Recent activity (last 7 days)
    week_ago = date.today() - timedelta(days=7)
    recent_journals = len([e for e in journal_entries if e.entry_date >= week_ago])
    recent_moods = len([m for m in mood_entries if m.logged_date >= week_ago])
    
    return {
        "summary": {
            "total_journal_entries": len(journal_entries),
            "total_mood_logs": len(mood_entries),
            "recent_journals": recent_journals,
            "recent_moods": recent_moods,
            "avg_mood": avg_mood,
            "wellness_score": wellness_score,
            "wellness_category": wellness_category,
            "streak": calculate_streak(mood_entries)
        },
        "mood_distribution": mood_counts,
        "activity_streak": calculate_streak(mood_entries),
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/analytics/export/json")
async def export_data_json(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export all user data as JSON for current user"""
    # Get all journal entries for current user
    journal_result = await db.execute(
        select(JournalEntry).where(JournalEntry.user_id == current_user.id)
    )
    journal_entries = journal_result.scalars().all()
    
    # Get all mood entries for current user
    mood_result = await db.execute(
        select(MoodLog).where(MoodLog.user_id == current_user.id)
    )
    mood_entries = mood_result.scalars().all()
    
    data = {
        "export_date": datetime.utcnow().isoformat(),
        "user_id": str(current_user.id),
        "journal_entries": [
            {
                "id": str(entry.id),
                "title": entry.title,
                "content": entry.content,
                "entry_date": entry.entry_date.isoformat(),
                "created_at": entry.created_at.isoformat()
            }
            for entry in journal_entries
        ],
        "mood_logs": [
            {
                "id": str(mood.id),
                "mood": mood.mood,
                "score": float(mood.score),
                "logged_date": mood.logged_date.isoformat(),
                "created_at": mood.created_at.isoformat()
            }
            for mood in mood_entries
        ]
    }
    
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=yuva_wellness_data.json"}
    )


@router.get("/analytics/export/csv")
async def export_mood_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export mood data as CSV for current user"""
    # Get all mood entries for current user
    mood_result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.logged_date.desc())
    )
    mood_entries = mood_result.scalars().all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Date", "Mood", "Score", "Created At"])
    
    # Write data
    for mood in mood_entries:
        writer.writerow([
            mood.logged_date.isoformat(),
            mood.mood,
            float(mood.score),
            mood.created_at.isoformat()
        ])
    
    csv_content = output.getvalue()
    output.close()
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mood_data.csv"}
    )


@router.get("/analytics/insights")
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered insights from user data for current user"""
    # Get recent journal entries for current user
    journal_result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.entry_date.desc())
        .limit(10)
    )
    journal_entries = journal_result.scalars().all()
    
    # Get recent mood entries for current user
    mood_result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.logged_date.desc())
        .limit(30)
    )
    mood_entries = mood_result.scalars().all()
    
    insights = []
    
    # Analyze journal sentiment trends
    if journal_entries:
        sentiments = []
        for entry in journal_entries:
            sentiment = analyze_sentiment(entry.content)
            sentiments.append(sentiment["polarity"])
        
        avg_sentiment = sum(sentiments) / len(sentiments)
        
        if avg_sentiment > 0.2:
            insights.append({
                "type": "positive",
                "title": "Positive Trend Detected",
                "description": "Your recent journal entries show increasingly positive sentiment. Keep up the great work!"
            })
        elif avg_sentiment < -0.2:
            insights.append({
                "type": "concern",
                "title": "Consider Self-Care",
                "description": "Your recent entries suggest you might benefit from some self-care activities."
            })
    
    # Analyze mood consistency
    if len(mood_entries) >= 7:
        recent_moods = mood_entries[:7]
        mood_variety = len(set(m.mood for m in recent_moods))
        
        if mood_variety == 1:
            insights.append({
                "type": "info",
                "title": "Consistent Mood Pattern",
                "description": "You've been logging the same mood recently. Consider exploring different emotional states."
            })
    
    # Check for regular logging
    if len(mood_entries) >= 5:
        dates = [m.logged_date for m in mood_entries[:5]]
        date_gaps = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
        avg_gap = sum(date_gaps) / len(date_gaps)
        
        if avg_gap <= 2:
            insights.append({
                "type": "achievement",
                "title": "Great Consistency!",
                "description": "You're maintaining a regular mood tracking habit. This helps build self-awareness."
            })
    
    return {"insights": insights}


def calculate_streak(mood_entries: List[MoodLog]) -> int:
    """Calculate current mood logging streak"""
    if not mood_entries:
        return 0
    
    # Sort by date (most recent first)
    sorted_entries = sorted(mood_entries, key=lambda x: x.logged_date, reverse=True)
    
    streak = 0
    current_date = date.today()
    
    for entry in sorted_entries:
        if entry.logged_date == current_date:
            streak += 1
            current_date -= timedelta(days=1)
        elif entry.logged_date == current_date:
            # Allow for same day multiple entries
            continue
        else:
            break
    
    return streak


def analyze_sentiment(text: str) -> Dict[str, float]:
    """Simple sentiment analysis fallback"""
    positive_words = ['good', 'great', 'happy', 'joy', 'love', 'excellent', 'wonderful', 'amazing']
    negative_words = ['bad', 'sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'depressed']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count + negative_count == 0:
        polarity = 0.0
    else:
        polarity = (positive_count - negative_count) / (positive_count + negative_count)
    
    return {"polarity": polarity, "subjectivity": 0.5}