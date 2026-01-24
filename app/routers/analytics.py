"""
Enhanced Analytics Router with Export Features
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException, Response
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import List, Dict, Any
import json
import csv
from io import StringIO

from ..models.db import JournalEntry, MoodLog, get_session
from ..services.ml_analytics import analyze_sentiment, analyze_mood_patterns

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    return templates.TemplateResponse("analytics.html", {"request": request})


@router.get("/api/analytics/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data"""
    with get_session() as session:
        # Get recent entries
        journal_entries = session.query(JournalEntry).order_by(JournalEntry.entry_date.desc()).limit(30).all()
        mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).limit(30).all()
        
        # Calculate statistics
        total_entries = len(journal_entries)
        total_moods = len(mood_entries)
        
        # Mood distribution
        mood_counts = {}
        for mood in mood_entries:
            mood_counts[mood.mood] = mood_counts.get(mood.mood, 0) + 1
        
        # Recent activity (last 7 days)
        week_ago = date.today() - timedelta(days=7)
        recent_journals = len([e for e in journal_entries if e.entry_date >= week_ago])
        recent_moods = len([m for m in mood_entries if m.logged_date >= week_ago])
        
        return {
            "summary": {
                "total_journal_entries": total_entries,
                "total_mood_logs": total_moods,
                "recent_journals": recent_journals,
                "recent_moods": recent_moods
            },
            "mood_distribution": mood_counts,
            "activity_streak": calculate_streak(mood_entries),
            "last_updated": datetime.utcnow().isoformat()
        }


@router.get("/api/analytics/export/json")
async def export_data_json():
    """Export all user data as JSON"""
    with get_session() as session:
        journal_entries = session.query(JournalEntry).all()
        mood_entries = session.query(MoodLog).all()
        
        data = {
            "export_date": datetime.utcnow().isoformat(),
            "journal_entries": [
                {
                    "id": entry.id,
                    "title": entry.title,
                    "content": entry.content,
                    "entry_date": entry.entry_date.isoformat(),
                    "created_at": entry.created_at.isoformat()
                }
                for entry in journal_entries
            ],
            "mood_logs": [
                {
                    "id": mood.id,
                    "mood": mood.mood,
                    "note": mood.note,
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


@router.get("/api/analytics/export/csv")
async def export_mood_csv():
    """Export mood data as CSV"""
    with get_session() as session:
        mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).all()
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["Date", "Mood", "Note", "Created At"])
        
        # Write data
        for mood in mood_entries:
            writer.writerow([
                mood.logged_date.isoformat(),
                mood.mood,
                mood.note,
                mood.created_at.isoformat()
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=mood_data.csv"}
        )


@router.get("/api/analytics/insights")
async def get_insights():
    """Get AI-powered insights from user data"""
    with get_session() as session:
        journal_entries = session.query(JournalEntry).order_by(JournalEntry.entry_date.desc()).limit(10).all()
        mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).limit(30).all()
        
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