from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from ..models.db import JournalEntry, MoodLog, get_session

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/journal", response_class=HTMLResponse)
async def journal_page(request: Request):
    return templates.TemplateResponse("journal.html", {"request": request})

@router.get("/mood", response_class=HTMLResponse)
async def mood_page(request: Request):
    return templates.TemplateResponse("mood.html", {"request": request})

class JournalIn(BaseModel):
    title: str = ""
    content: str
    entry_date: str = ""

@router.post("/api/journal")
async def create_journal(entry: JournalIn):
    try:
        with get_session() as session:
            row = JournalEntry(
                title=entry.title,
                content=entry.content,
                entry_date=entry.entry_date or str(date.today()),
                created_at=str(date.today())
            )
            session.add(row)
            session.commit()
            return {"message": "saved"}
    except Exception as e:
        print(f"Error: {e}")
        return {"error": "failed"}

@router.get("/api/journal")
async def get_entries():
    try:
        with get_session() as session:
            entries = session.query(JournalEntry).all()
            return [{"id": e.id, "title": e.title, "content": e.content, "date": e.entry_date} for e in entries]
    except:
        return []

@router.put("/api/journal/{entry_id}")
async def update_entry(entry_id: int, entry: JournalIn):
    try:
        with get_session() as session:
            existing = session.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
            if not existing:
                return {"error": "Entry not found"}
            
            existing.title = entry.title
            existing.content = entry.content
            existing.entry_date = entry.entry_date or existing.entry_date
            
            session.commit()
            return {"message": "Entry updated successfully"}
    except Exception as e:
        print(f"Update error: {e}")
        return {"error": "Failed to update entry"}

@router.delete("/api/journal/{entry_id}")
async def delete_entry(entry_id: int):
    try:
        with get_session() as session:
            entry = session.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
            if not entry:
                return {"error": "Entry not found"}
            
            session.delete(entry)
            session.commit()
            return {"message": "Entry deleted successfully"}
    except Exception as e:
        print(f"Delete error: {e}")
        return {"error": "Failed to delete entry"}

class MoodIn(BaseModel):
    mood: str
    note: str = ""

@router.post("/api/mood/log")
async def log_mood(mood_entry: MoodIn):
    try:
        with get_session() as session:
            today_str = str(date.today())
            
            # Check if there's already an entry for today
            existing_entry = session.query(MoodLog).filter(
                MoodLog.logged_date == today_str
            ).order_by(MoodLog.id.desc()).first()
            
            if existing_entry:
                # Update existing entry
                existing_entry.mood = mood_entry.mood
                existing_entry.note = mood_entry.note or ""
                existing_entry.created_at = today_str
                session.commit()
                session.refresh(existing_entry)
                return {"message": "Mood updated for today", "id": existing_entry.id, "updated": True}
            else:
                # Create new entry
                row = MoodLog(
                    mood=mood_entry.mood,
                    note=mood_entry.note or "",
                    logged_date=today_str,
                    created_at=today_str
                )
                
                session.add(row)
                session.commit()
                session.refresh(row)
                
                return {"message": "Mood logged successfully", "id": row.id, "updated": False}
            
    except Exception as e:
        print(f"Mood log error: {e}")
        return {"error": f"Failed to log mood: {str(e)}"}

@router.get("/api/mood/entries")
async def get_mood_entries():
    try:
        with get_session() as session:
            entries = session.query(MoodLog).order_by(MoodLog.id.desc()).all()
            return [{"id": e.id, "mood": e.mood, "note": e.note or "", "date": e.logged_date} for e in entries]
    except Exception as e:
        print(f"Mood entries error: {e}")
        return []

@router.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    return templates.TemplateResponse("analytics.html", {"request": request})

@router.get("/api/analytics/risk-assessment")
async def get_risk_assessment():
    try:
        with get_session() as session:
            entries = session.query(JournalEntry).all()
            
            if len(entries) == 0:
                return {
                    "level": "low",
                    "message": "No data available for risk assessment. Start journaling to get insights.",
                    "factors": []
                }
            
            # Simple risk assessment based on entry count and content
            risk_level = "low"
            message = "Your wellness indicators look positive. Keep up the good work!"
            factors = []
            
            if len(entries) < 3:
                factors.append("Limited data available - continue journaling for better insights")
            
            if len(entries) >= 5:
                factors.append("Regular journaling habit detected")
                message = "Great job maintaining consistent wellness tracking!"
            
            return {
                "level": risk_level,
                "message": message,
                "factors": factors
            }
    except Exception as e:
        return {
            "level": "low",
            "message": "Unable to assess risk at this time.",
            "factors": []
        }

@router.get("/api/analytics/mood-trends")
async def get_mood_trends():
    try:
        with get_session() as session:
            mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).all()
            
            if not mood_entries:
                return {
                    "overall_trend": "No data",
                    "description": "No mood data available. Start logging your moods to see trends!",
                    "trend_percentage": 0,
                    "weekly_breakdown": [],
                    "assessment_insights": {},
                    "mood_distribution": {}
                }
            
            # Enhanced mood analysis with assessment data
            mood_values = {
                # Very positive emotions (5 points)
                "🤩": 5, "🥰": 5, "🤗": 5,
                # Positive emotions (4 points)
                "😊": 4, "😌": 4, "😎": 4, "🙂": 4,
                # Neutral emotions (3 points)
                "😐": 3, "🤔": 3,
                # Low energy/tired (2 points)
                "😴": 2, "😔": 2,
                # Challenging emotions (1 point)
                "😰": 1, "😫": 1, "😤": 1, "😢": 1, "😡": 1, "😞": 1
            }
            
            # Calculate overall trend
            total_score = 0
            valid_entries = 0
            mood_distribution = {}
            assessment_data = {"energy": [], "stress": [], "sleep": [], "social": []}
            
            for entry in mood_entries:
                mood = entry.mood.strip() if entry.mood else ""
                if mood in mood_values:
                    total_score += mood_values[mood]
                    valid_entries += 1
                    
                    # Count mood distribution
                    mood_distribution[mood] = mood_distribution.get(mood, 0) + 1
                    
                    # Extract assessment data from notes if available
                    if entry.note and "Assessment:" in entry.note:
                        assessment_part = entry.note.split("Assessment:")[-1].strip()
                        if "Energy:" in assessment_part:
                            try:
                                # Parse assessment data
                                parts = assessment_part.split(", ")
                                for part in parts:
                                    if "Energy:" in part:
                                        energy_val = part.split(":")[1].strip()
                                        energy_score = {"high": 3, "moderate": 2, "low": 1}.get(energy_val, 2)
                                        assessment_data["energy"].append(energy_score)
                                    elif "Stress:" in part:
                                        stress_val = part.split(":")[1].strip()
                                        stress_score = {"low": 3, "moderate": 2, "high": 1}.get(stress_val, 2)
                                        assessment_data["stress"].append(stress_score)
                                    elif "Sleep:" in part:
                                        sleep_val = part.split(":")[1].strip()
                                        sleep_score = {"excellent": 3, "okay": 2, "poor": 1}.get(sleep_val, 2)
                                        assessment_data["sleep"].append(sleep_score)
                                    elif "Social:" in part:
                                        social_val = part.split(":")[1].strip()
                                        social_score = {"connected": 3, "somewhat": 2, "isolated": 1}.get(social_val, 2)
                                        assessment_data["social"].append(social_score)
                            except:
                                pass  # Skip parsing errors
            
            if valid_entries == 0:
                return {
                    "overall_trend": "No data",
                    "description": "No valid mood data found.",
                    "trend_percentage": 0,
                    "weekly_breakdown": [],
                    "assessment_insights": {},
                    "mood_distribution": {}
                }
            
            avg_mood = total_score / valid_entries
            
            # Calculate weekly breakdown (last 4 weeks)
            weekly_breakdown = []
            today = date.today()
            
            for week in range(4):
                week_start = today - timedelta(days=(week + 1) * 7)
                week_end = today - timedelta(days=week * 7)
                
                week_entries = []
                for e in mood_entries:
                    try:
                        # Parse the string date
                        entry_date = datetime.strptime(e.logged_date, "%Y-%m-%d").date()
                        if week_start <= entry_date <= week_end:
                            week_entries.append(e)
                    except:
                        continue  # Skip entries with invalid dates
                
                if week_entries:
                    week_scores = [mood_values.get(e.mood, 3) for e in week_entries]
                    week_avg = sum(week_scores) / len(week_scores)
                    
                    weekly_breakdown.append({
                        "week": f"Week {4-week}",
                        "average_score": round(week_avg, 1),
                        "entries_count": len(week_entries),
                        "date_range": f"{week_start.strftime('%m/%d')} - {week_end.strftime('%m/%d')}"
                    })
            
            # Calculate assessment insights
            assessment_insights = {}
            for category, scores in assessment_data.items():
                if scores:
                    avg_score = sum(scores) / len(scores)
                    assessment_insights[category] = {
                        "average": round(avg_score, 1),
                        "trend": "improving" if len(scores) > 1 and scores[-1] > scores[0] else "stable",
                        "count": len(scores)
                    }
            
            # Determine overall trend with more nuanced analysis
            if avg_mood >= 4.0:
                trend = "Excellent"
                percentage = min(int((avg_mood / 5) * 100), 100)
                description = f"Outstanding mood trend! You're thriving with an average score of {avg_mood:.1f}/5.0"
            elif avg_mood >= 3.5:
                trend = "Very Positive"
                percentage = min(int((avg_mood / 5) * 100), 100)
                description = f"Strong positive mood trend! Average score: {avg_mood:.1f}/5.0"
            elif avg_mood >= 3.0:
                trend = "Positive"
                percentage = min(int((avg_mood / 5) * 100), 100)
                description = f"Good mood stability with room for growth. Average score: {avg_mood:.1f}/5.0"
            elif avg_mood >= 2.5:
                trend = "Neutral"
                percentage = min(int((avg_mood / 5) * 100), 100)
                description = f"Balanced mood pattern. Consider activities to boost wellbeing. Average: {avg_mood:.1f}/5.0"
            elif avg_mood >= 2.0:
                trend = "Needs Support"
                percentage = min(int((avg_mood / 5) * 100), 100)
                description = f"Challenging period detected. Focus on self-care and support. Average: {avg_mood:.1f}/5.0"
            else:
                trend = "Requires Attention"
                percentage = min(int((avg_mood / 5) * 100), 100)
                description = f"Significant challenges present. Consider professional support. Average: {avg_mood:.1f}/5.0"
            
            return {
                "overall_trend": trend,
                "description": description,
                "trend_percentage": percentage,
                "weekly_breakdown": weekly_breakdown,
                "assessment_insights": assessment_insights,
                "mood_distribution": mood_distribution,
                "total_entries": valid_entries,
                "average_score": round(avg_mood, 1)
            }
            
    except Exception as e:
        print(f"Mood trends error: {e}")
        return {
            "overall_trend": "Error",
            "description": "Unable to analyze mood trends at this time.",
            "trend_percentage": 0,
            "weekly_breakdown": [],
            "assessment_insights": {},
            "mood_distribution": {}
        }

@router.get("/api/analytics/patterns")
async def get_patterns():
    try:
        with get_session() as session:
            journal_entries = session.query(JournalEntry).all()
            mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).all()
            
            patterns = []
            
            # Basic tracking patterns
            if len(journal_entries) >= 3:
                patterns.append("📝 Regular journaling habit detected - great for self-reflection!")
            
            if len(mood_entries) >= 5:
                patterns.append("📊 Consistent mood tracking shows good self-awareness")
            
            # Advanced assessment-based patterns
            assessment_entries = [e for e in mood_entries if e.note and "Assessment:" in e.note]
            
            if len(assessment_entries) >= 3:
                patterns.append("🧠 Using detailed mood assessments - excellent for understanding emotional patterns!")
                
                # Analyze assessment patterns
                energy_patterns = []
                stress_patterns = []
                sleep_patterns = []
                social_patterns = []
                emotional_patterns = []
                physical_patterns = []
                
                for entry in assessment_entries[:15]:  # Last 15 assessments for better analysis
                    if "Assessment:" in entry.note:
                        assessment_part = entry.note.split("Assessment:")[-1].strip()
                        try:
                            parts = assessment_part.split(", ")
                            for part in parts:
                                if "Energy:" in part:
                                    energy_val = part.split(":")[1].strip()
                                    energy_patterns.append(energy_val)
                                elif "Stress:" in part:
                                    stress_val = part.split(":")[1].strip()
                                    stress_patterns.append(stress_val)
                                elif "Sleep:" in part:
                                    sleep_val = part.split(":")[1].strip()
                                    sleep_patterns.append(sleep_val)
                                elif "Social:" in part:
                                    social_val = part.split(":")[1].strip()
                                    social_patterns.append(social_val)
                                elif "Emotion:" in part:
                                    emotion_val = part.split(":")[1].strip()
                                    emotional_patterns.append(emotion_val)
                                elif "Physical:" in part:
                                    physical_val = part.split(":")[1].strip()
                                    physical_patterns.append(physical_val)
                        except:
                            continue
                
                # Advanced Energy Pattern Analysis
                if energy_patterns:
                    high_energy_count = energy_patterns.count("high")
                    moderate_energy_count = energy_patterns.count("moderate")
                    low_energy_count = energy_patterns.count("low")
                    total_energy = len(energy_patterns)
                    
                    if high_energy_count >= total_energy * 0.7:
                        patterns.append("⚡ Consistently high energy levels - you're maintaining excellent vitality!")
                    elif low_energy_count >= total_energy * 0.6:
                        patterns.append("🔋 Frequent low energy detected - consider sleep optimization, nutrition, and light exercise")
                    elif moderate_energy_count >= total_energy * 0.6:
                        patterns.append("🔄 Stable moderate energy levels - good baseline with potential for improvement")
                    
                    # Energy trend analysis
                    if len(energy_patterns) >= 5:
                        recent_energy = energy_patterns[:3]
                        older_energy = energy_patterns[-3:]
                        recent_high = recent_energy.count("high")
                        older_high = older_energy.count("high")
                        
                        if recent_high > older_high:
                            patterns.append("📈 Energy levels trending upward - keep up whatever you're doing!")
                        elif recent_high < older_high:
                            patterns.append("📉 Energy levels declining - consider reviewing sleep, diet, and stress factors")
                
                # Advanced Stress Pattern Analysis
                if stress_patterns:
                    high_stress_count = stress_patterns.count("high")
                    moderate_stress_count = stress_patterns.count("moderate")
                    low_stress_count = stress_patterns.count("low")
                    total_stress = len(stress_patterns)
                    
                    if high_stress_count >= total_stress * 0.6:
                        patterns.append("🌡️ Chronic high stress detected - prioritize stress management techniques and consider professional support")
                    elif low_stress_count >= total_stress * 0.7:
                        patterns.append("🧘 Excellent stress management - you're maintaining healthy stress levels!")
                    elif moderate_stress_count >= total_stress * 0.5:
                        patterns.append("⚖️ Moderate stress levels - manageable but watch for triggers")
                    
                    # Stress-Energy correlation
                    if energy_patterns and len(stress_patterns) >= 5:
                        stress_energy_correlation = []
                        for i in range(min(len(stress_patterns), len(energy_patterns))):
                            if stress_patterns[i] == "high" and energy_patterns[i] == "low":
                                stress_energy_correlation.append("negative")
                            elif stress_patterns[i] == "low" and energy_patterns[i] == "high":
                                stress_energy_correlation.append("positive")
                        
                        if stress_energy_correlation.count("negative") >= 3:
                            patterns.append("🔗 High stress correlates with low energy - stress management could boost your vitality")
                
                # Advanced Sleep Pattern Analysis
                if sleep_patterns:
                    poor_sleep_count = sleep_patterns.count("poor")
                    okay_sleep_count = sleep_patterns.count("okay")
                    excellent_sleep_count = sleep_patterns.count("excellent")
                    total_sleep = len(sleep_patterns)
                    
                    if poor_sleep_count >= total_sleep * 0.5:
                        patterns.append("😴 Sleep quality concerns detected - focus on sleep hygiene for better rest")
                    elif excellent_sleep_count >= total_sleep * 0.6:
                        patterns.append("🛏️ Excellent sleep quality pattern - this strongly supports your overall wellbeing!")
                    elif okay_sleep_count >= total_sleep * 0.6:
                        patterns.append("💤 Decent sleep quality - small improvements could yield big benefits")
                    
                    # Sleep-Energy correlation
                    if energy_patterns and len(sleep_patterns) >= 5:
                        sleep_energy_correlation = []
                        for i in range(min(len(sleep_patterns), len(energy_patterns))):
                            if sleep_patterns[i] == "excellent" and energy_patterns[i] == "high":
                                sleep_energy_correlation.append("positive")
                            elif sleep_patterns[i] == "poor" and energy_patterns[i] == "low":
                                sleep_energy_correlation.append("negative")
                        
                        if sleep_energy_correlation.count("positive") >= 2:
                            patterns.append("🌙 Good sleep strongly correlates with high energy - maintain your sleep routine!")
                        elif sleep_energy_correlation.count("negative") >= 2:
                            patterns.append("⚠️ Poor sleep is impacting your energy levels - prioritize sleep improvement")
                
                # Advanced Social Pattern Analysis
                if social_patterns:
                    isolated_count = social_patterns.count("isolated")
                    somewhat_count = social_patterns.count("somewhat")
                    connected_count = social_patterns.count("connected")
                    total_social = len(social_patterns)
                    
                    if isolated_count >= total_social * 0.6:
                        patterns.append("👥 Social isolation pattern - consider reaching out to friends, family, or joining communities")
                    elif connected_count >= total_social * 0.7:
                        patterns.append("🤝 Strong social connections - your relationships are supporting your wellbeing!")
                    elif somewhat_count >= total_social * 0.5:
                        patterns.append("🌐 Moderate social engagement - opportunities to deepen connections")
                    
                    # Social-Mood correlation
                    if len(social_patterns) >= 5:
                        recent_social = social_patterns[:3]
                        if recent_social.count("isolated") >= 2:
                            patterns.append("🔍 Recent social isolation trend - consider scheduling social activities")
                        elif recent_social.count("connected") >= 2:
                            patterns.append("🌟 Recent increase in social connection - great for mental health!")
            
            # Advanced Mood Consistency and Variety Patterns
            if len(mood_entries) >= 7:
                recent_moods = mood_entries[:7]
                mood_variety = len(set(m.mood for m in recent_moods))
                
                if mood_variety == 1:
                    patterns.append("🎯 Very consistent mood pattern - consider exploring emotional range or checking for mood suppression")
                elif mood_variety >= 5:
                    patterns.append("🌈 Rich emotional variety - you're experiencing a full range of feelings, which is healthy")
                elif mood_variety <= 2:
                    patterns.append("📊 Limited emotional range detected - consider mindfulness practices to increase emotional awareness")
                
                # Mood stability analysis
                positive_moods = ['😊', '🥰', '😌', '🤗', '😎', '🤩', '🙂']
                challenging_moods = ['😔', '😰', '😫', '😢', '😞', '😡', '😤']
                
                recent_positive = sum(1 for m in recent_moods if m.mood in positive_moods)
                recent_challenging = sum(1 for m in recent_moods if m.mood in challenging_moods)
                
                if recent_positive >= 5:
                    patterns.append("🌟 Strong positive mood trend - you're in a great mental space!")
                elif recent_challenging >= 4:
                    patterns.append("💙 Challenging period detected - be gentle with yourself and consider support")
                elif recent_positive >= 3 and recent_challenging <= 1:
                    patterns.append("✨ Balanced positive outlook with good emotional resilience")
            
            # Weekly and Daily Pattern Analysis
            if len(mood_entries) >= 14:
                # Analyze day-of-week patterns (if we had day data)
                patterns.append("📈 Long-term tracking commitment - valuable data for understanding trends")
                
                # Analyze mood volatility
                if len(mood_entries) >= 10:
                    mood_scores = []
                    mood_values = {
                        '😊': 4, '🥰': 5, '😌': 4, '🤗': 5, '😎': 4, '🤩': 5, '🙂': 4,
                        '😐': 3, '🤔': 3, '😴': 2, '😔': 2,
                        '😰': 1, '😫': 1, '😤': 1, '😢': 1, '😡': 1, '😞': 1
                    }
                    
                    for entry in mood_entries[:10]:
                        if entry.mood in mood_values:
                            mood_scores.append(mood_values[entry.mood])
                    
                    if len(mood_scores) >= 5:
                        # Calculate mood volatility
                        avg_score = sum(mood_scores) / len(mood_scores)
                        variance = sum((score - avg_score) ** 2 for score in mood_scores) / len(mood_scores)
                        
                        if variance <= 0.5:
                            patterns.append("🎯 Very stable mood pattern - consistent emotional regulation")
                        elif variance >= 2.0:
                            patterns.append("🎢 High mood variability - consider identifying triggers for mood swings")
                        else:
                            patterns.append("⚖️ Moderate mood variability - normal emotional fluctuation")
            
            # Frequency and Consistency Patterns
            if len(mood_entries) >= 10:
                try:
                    dates = []
                    for m in mood_entries[:10]:
                        try:
                            entry_date = datetime.strptime(m.logged_date, "%Y-%m-%d").date()
                            dates.append(entry_date)
                        except:
                            continue
                    
                    if len(dates) >= 2:
                        date_gaps = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
                        avg_gap = sum(date_gaps) / len(date_gaps) if date_gaps else 0
                        
                        if avg_gap <= 1.2:
                            patterns.append("📅 Excellent daily tracking consistency - building strong self-awareness habits!")
                        elif avg_gap <= 2.0:
                            patterns.append("📊 Good tracking consistency with occasional gaps - try setting daily reminders")
                        elif avg_gap <= 3.5:
                            patterns.append("📈 Regular tracking pattern - room for more consistency")
                        else:
                            patterns.append("⏰ Irregular tracking pattern - consistent daily logging would provide better insights")
                        
                        # Weekend vs weekday patterns (approximate)
                        if len(dates) >= 7:
                            patterns.append("📊 Sufficient data for weekly pattern analysis - consider tracking time of day for deeper insights")
                except:
                    pass
            
            # Seasonal and Time-based Patterns (if we had more data)
            if len(mood_entries) >= 30:
                patterns.append("🗓️ Monthly tracking milestone reached - excellent commitment to mental health monitoring!")
                
                # Analyze recent vs historical trends
                recent_entries = mood_entries[:10]
                older_entries = mood_entries[10:20] if len(mood_entries) >= 20 else []
                
                if older_entries:
                    recent_positive = sum(1 for m in recent_entries if m.mood in ['😊', '🥰', '😌', '🤗', '😎', '🤩', '🙂'])
                    older_positive = sum(1 for m in older_entries if m.mood in ['😊', '🥰', '😌', '🤗', '😎', '🤩', '🙂'])
                    
                    recent_ratio = recent_positive / len(recent_entries)
                    older_ratio = older_positive / len(older_entries)
                    
                    if recent_ratio > older_ratio + 0.2:
                        patterns.append("📈 Significant mood improvement over time - your wellness efforts are paying off!")
                    elif recent_ratio < older_ratio - 0.2:
                        patterns.append("📉 Mood decline detected over time - consider reviewing recent life changes or stressors")
                    else:
                        patterns.append("➡️ Stable mood patterns over time - consistent emotional baseline")
            
            # Meta-patterns about tracking behavior itself
            if len(assessment_entries) >= 5 and len(mood_entries) >= 10:
                assessment_ratio = len(assessment_entries) / len(mood_entries)
                if assessment_ratio >= 0.7:
                    patterns.append("🎯 High detailed assessment usage - you're getting maximum insight from your tracking!")
                elif assessment_ratio >= 0.3:
                    patterns.append("📊 Good balance of quick and detailed mood logging")
                else:
                    patterns.append("💡 Consider using detailed assessments more often for deeper insights")
            
            # Provide actionable insights based on patterns
            if len(patterns) >= 8:
                patterns.append("🔍 Rich pattern data detected - you have excellent self-awareness through consistent tracking!")
            elif len(patterns) >= 5:
                patterns.append("📈 Good pattern recognition emerging - continue consistent tracking for deeper insights")
            
            if not patterns:
                patterns.append("🌱 Keep logging moods and using assessments to identify meaningful patterns")
            
            return {"patterns": patterns}
    except Exception as e:
        print(f"Patterns error: {e}")
        return {"patterns": ["Unable to detect patterns at this time"]}

@router.get("/api/analytics/advanced-patterns")
async def get_advanced_patterns():
    """Get advanced pattern analysis with predictive insights"""
    try:
        with get_session() as session:
            mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).all()
            journal_entries = session.query(JournalEntry).all()
            
            advanced_patterns = {
                "predictive_insights": [],
                "correlation_analysis": [],
                "behavioral_trends": [],
                "risk_indicators": [],
                "wellness_opportunities": []
            }
            
            if len(mood_entries) < 5:
                return {
                    "message": "Need more data for advanced pattern analysis",
                    "advanced_patterns": advanced_patterns
                }
            
            # Predictive Insights
            recent_moods = mood_entries[:7]
            mood_values = {
                '😊': 4, '🥰': 5, '😌': 4, '🤗': 5, '😎': 4, '🤩': 5, '🙂': 4,
                '😐': 3, '🤔': 3, '😴': 2, '😔': 2,
                '😰': 1, '😫': 1, '😤': 1, '😢': 1, '😡': 1, '😞': 1
            }
            
            recent_scores = [mood_values.get(m.mood, 3) for m in recent_moods]
            if len(recent_scores) >= 3:
                trend = recent_scores[0] - recent_scores[-1]
                if trend > 1:
                    advanced_patterns["predictive_insights"].append({
                        "type": "positive_trend",
                        "message": "📈 Mood trajectory suggests continued improvement - maintain current wellness practices",
                        "confidence": "high" if trend > 2 else "moderate"
                    })
                elif trend < -1:
                    advanced_patterns["predictive_insights"].append({
                        "type": "declining_trend",
                        "message": "📉 Mood decline detected - consider proactive wellness interventions",
                        "confidence": "high" if trend < -2 else "moderate"
                    })
                else:
                    advanced_patterns["predictive_insights"].append({
                        "type": "stable_trend",
                        "message": "➡️ Stable mood pattern - good emotional regulation",
                        "confidence": "moderate"
                    })
            
            # Correlation Analysis
            assessment_entries = [e for e in mood_entries if e.note and "Assessment:" in e.note]
            if len(assessment_entries) >= 5:
                correlations = analyze_factor_correlations(assessment_entries)
                advanced_patterns["correlation_analysis"] = correlations
            
            # Behavioral Trends
            if len(mood_entries) >= 10:
                behavioral_trends = analyze_behavioral_trends(mood_entries)
                advanced_patterns["behavioral_trends"] = behavioral_trends
            
            # Risk Indicators
            risk_indicators = identify_risk_indicators(mood_entries, assessment_entries)
            advanced_patterns["risk_indicators"] = risk_indicators
            
            # Wellness Opportunities
            opportunities = identify_wellness_opportunities(mood_entries, assessment_entries, journal_entries)
            advanced_patterns["wellness_opportunities"] = opportunities
            
            return {"advanced_patterns": advanced_patterns}
            
    except Exception as e:
        print(f"Advanced patterns error: {e}")
        return {"advanced_patterns": {
            "predictive_insights": [],
            "correlation_analysis": [],
            "behavioral_trends": [],
            "risk_indicators": [],
            "wellness_opportunities": []
        }}

def analyze_factor_correlations(assessment_entries):
    """Analyze correlations between different wellness factors"""
    correlations = []
    
    # Extract factor data
    factors = {"energy": [], "stress": [], "sleep": [], "social": [], "emotion": [], "physical": []}
    
    for entry in assessment_entries[:10]:
        if "Assessment:" in entry.note:
            assessment_part = entry.note.split("Assessment:")[-1].strip()
            factor_scores = {}
            
            try:
                parts = assessment_part.split(", ")
                for part in parts:
                    if "Energy:" in part:
                        val = part.split(":")[1].strip()
                        factor_scores["energy"] = {"high": 3, "moderate": 2, "low": 1}.get(val, 2)
                    elif "Stress:" in part:
                        val = part.split(":")[1].strip()
                        factor_scores["stress"] = {"low": 3, "moderate": 2, "high": 1}.get(val, 2)
                    elif "Sleep:" in part:
                        val = part.split(":")[1].strip()
                        factor_scores["sleep"] = {"excellent": 3, "okay": 2, "poor": 1}.get(val, 2)
                    elif "Social:" in part:
                        val = part.split(":")[1].strip()
                        factor_scores["social"] = {"connected": 3, "somewhat": 2, "isolated": 1}.get(val, 2)
                
                # Add scores to factors
                for factor, score in factor_scores.items():
                    factors[factor].append(score)
            except:
                continue
    
    # Analyze correlations
    if len(factors["sleep"]) >= 3 and len(factors["energy"]) >= 3:
        sleep_energy_correlation = calculate_simple_correlation(factors["sleep"], factors["energy"])
        if sleep_energy_correlation > 0.6:
            correlations.append({
                "factors": ["sleep", "energy"],
                "strength": "strong",
                "message": "🌙 Strong correlation: Better sleep significantly improves energy levels"
            })
    
    if len(factors["stress"]) >= 3 and len(factors["energy"]) >= 3:
        stress_energy_correlation = calculate_simple_correlation(factors["stress"], factors["energy"])
        if stress_energy_correlation > 0.5:
            correlations.append({
                "factors": ["stress", "energy"],
                "strength": "moderate",
                "message": "⚖️ Moderate correlation: Lower stress levels boost energy"
            })
    
    if len(factors["social"]) >= 3 and len(factors["stress"]) >= 3:
        social_stress_correlation = calculate_simple_correlation(factors["social"], factors["stress"])
        if social_stress_correlation > 0.4:
            correlations.append({
                "factors": ["social", "stress"],
                "strength": "moderate",
                "message": "🤝 Social connections help reduce stress levels"
            })
    
    return correlations

def calculate_simple_correlation(list1, list2):
    """Calculate simple correlation coefficient"""
    if len(list1) != len(list2) or len(list1) < 2:
        return 0
    
    n = len(list1)
    sum1 = sum(list1)
    sum2 = sum(list2)
    sum1_sq = sum(x*x for x in list1)
    sum2_sq = sum(x*x for x in list2)
    sum_products = sum(list1[i] * list2[i] for i in range(n))
    
    numerator = n * sum_products - sum1 * sum2
    denominator = ((n * sum1_sq - sum1**2) * (n * sum2_sq - sum2**2))**0.5
    
    if denominator == 0:
        return 0
    
    return abs(numerator / denominator)

def analyze_behavioral_trends(mood_entries):
    """Analyze behavioral trends from mood data"""
    trends = []
    
    if len(mood_entries) >= 14:
        # Analyze weekly patterns
        week1_moods = mood_entries[:7]
        week2_moods = mood_entries[7:14]
        
        mood_values = {
            '😊': 4, '🥰': 5, '😌': 4, '🤗': 5, '😎': 4, '🤩': 5, '🙂': 4,
            '😐': 3, '🤔': 3, '😴': 2, '😔': 2,
            '😰': 1, '😫': 1, '😤': 1, '😢': 1, '😡': 1, '😞': 1
        }
        
        week1_avg = sum(mood_values.get(m.mood, 3) for m in week1_moods) / len(week1_moods)
        week2_avg = sum(mood_values.get(m.mood, 3) for m in week2_moods) / len(week2_moods)
        
        if week1_avg > week2_avg + 0.5:
            trends.append({
                "type": "improvement",
                "message": "📈 Recent week shows significant mood improvement",
                "timeframe": "weekly"
            })
        elif week1_avg < week2_avg - 0.5:
            trends.append({
                "type": "decline",
                "message": "📉 Mood decline in recent week - consider wellness check-in",
                "timeframe": "weekly"
            })
    
    # Analyze consistency
    if len(mood_entries) >= 7:
        recent_moods = [m.mood for m in mood_entries[:7]]
        unique_moods = len(set(recent_moods))
        
        if unique_moods <= 2:
            trends.append({
                "type": "consistency",
                "message": "🎯 Very consistent mood pattern - stable emotional state",
                "timeframe": "recent"
            })
        elif unique_moods >= 5:
            trends.append({
                "type": "variability",
                "message": "🌈 High emotional variety - rich emotional experience",
                "timeframe": "recent"
            })
    
    return trends

def identify_risk_indicators(mood_entries, assessment_entries):
    """Identify potential risk indicators"""
    risks = []
    
    # Check for prolonged low mood
    if len(mood_entries) >= 5:
        challenging_moods = ['😔', '😰', '😫', '😢', '😞', '😡', '😤']
        recent_challenging = sum(1 for m in mood_entries[:5] if m.mood in challenging_moods)
        
        if recent_challenging >= 4:
            risks.append({
                "level": "high",
                "type": "prolonged_low_mood",
                "message": "⚠️ Prolonged challenging mood period - consider professional support",
                "recommendation": "Reach out to a mental health professional or trusted support person"
            })
        elif recent_challenging >= 3:
            risks.append({
                "level": "moderate",
                "type": "concerning_trend",
                "message": "🔍 Several challenging mood days - monitor closely",
                "recommendation": "Focus on self-care and consider talking to someone"
            })
    
    # Check assessment-based risks
    if len(assessment_entries) >= 3:
        high_stress_count = 0
        poor_sleep_count = 0
        low_energy_count = 0
        
        for entry in assessment_entries[:5]:
            if "Assessment:" in entry.note:
                if "Stress: high" in entry.note:
                    high_stress_count += 1
                if "Sleep: poor" in entry.note:
                    poor_sleep_count += 1
                if "Energy: low" in entry.note:
                    low_energy_count += 1
        
        if high_stress_count >= 3:
            risks.append({
                "level": "moderate",
                "type": "chronic_stress",
                "message": "🌡️ Chronic high stress detected",
                "recommendation": "Implement stress management techniques and consider professional guidance"
            })
        
        if poor_sleep_count >= 3:
            risks.append({
                "level": "moderate",
                "type": "sleep_issues",
                "message": "😴 Persistent sleep quality issues",
                "recommendation": "Focus on sleep hygiene and consider consulting a healthcare provider"
            })
    
    return risks

def identify_wellness_opportunities(mood_entries, assessment_entries, journal_entries):
    """Identify opportunities for wellness improvement"""
    opportunities = []
    
    # Journaling opportunities
    if len(journal_entries) < 3 and len(mood_entries) >= 5:
        opportunities.append({
            "type": "journaling",
            "message": "📝 Consider adding journaling to complement your mood tracking",
            "benefit": "Deeper self-reflection and emotional processing"
        })
    
    # Assessment opportunities
    if len(assessment_entries) < len(mood_entries) * 0.3:
        opportunities.append({
            "type": "detailed_assessment",
            "message": "🧠 Use detailed assessments more often for richer insights",
            "benefit": "Better understanding of factors affecting your mood"
        })
    
    # Consistency opportunities
    if len(mood_entries) >= 5:
        try:
            dates = []
            for m in mood_entries[:10]:
                try:
                    entry_date = datetime.strptime(m.logged_date, "%Y-%m-%d").date()
                    dates.append(entry_date)
                except:
                    continue
            
            if len(dates) >= 2:
                date_gaps = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
                avg_gap = sum(date_gaps) / len(date_gaps) if date_gaps else 0
                
                if avg_gap > 2:
                    opportunities.append({
                        "type": "consistency",
                        "message": "📅 More consistent daily tracking could reveal additional patterns",
                        "benefit": "Better trend identification and self-awareness"
                    })
        except:
            pass
    
    # Positive reinforcement opportunities
    if len(mood_entries) >= 7:
        positive_moods = ['😊', '🥰', '😌', '🤗', '😎', '🤩', '🙂']
        recent_positive = sum(1 for m in mood_entries[:7] if m.mood in positive_moods)
        
        if recent_positive >= 4:
            opportunities.append({
                "type": "strength_building",
                "message": "🌟 You're doing well! Consider identifying what's working to maintain this positive trend",
                "benefit": "Reinforce successful wellness strategies"
            })
    
    return opportunities

@router.get("/api/analytics/recommendations")
async def get_recommendations():
    try:
        with get_session() as session:
            journal_entries = session.query(JournalEntry).all()
            mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).all()
            
            recommendations = []
            
            # Basic tracking recommendations
            if len(journal_entries) < 3:
                recommendations.append("📝 Try journaling more frequently to gain better insights into your thoughts and feelings")
            
            if len(mood_entries) < 5:
                recommendations.append("📊 Log your mood daily using our detailed assessment to track emotional patterns")
            
            # Assessment-based recommendations
            assessment_entries = [e for e in mood_entries if e.note and "Assessment:" in e.note]
            
            if len(assessment_entries) >= 3:
                # Analyze recent assessments for personalized recommendations
                recent_assessments = assessment_entries[:5]
                energy_issues = 0
                stress_issues = 0
                sleep_issues = 0
                social_issues = 0
                
                for entry in recent_assessments:
                    if "Assessment:" in entry.note:
                        assessment_part = entry.note.split("Assessment:")[-1].strip()
                        try:
                            if "Energy: low" in assessment_part:
                                energy_issues += 1
                            if "Stress: high" in assessment_part:
                                stress_issues += 1
                            if "Sleep: poor" in assessment_part:
                                sleep_issues += 1
                            if "Social: isolated" in assessment_part:
                                social_issues += 1
                        except:
                            continue
                
                # Energy-based recommendations
                if energy_issues >= 2:
                    recommendations.extend([
                        "⚡ Consider light exercise or a short walk to boost energy levels",
                        "🍎 Focus on nutritious meals and stay hydrated throughout the day",
                        "☀️ Try to get some natural sunlight, especially in the morning"
                    ])
                
                # Stress-based recommendations
                if stress_issues >= 2:
                    recommendations.extend([
                        "🧘 Practice deep breathing exercises or meditation for 5-10 minutes daily",
                        "📝 Try writing down your worries to help process stressful thoughts",
                        "🎵 Listen to calming music or nature sounds when feeling overwhelmed"
                    ])
                
                # Sleep-based recommendations
                if sleep_issues >= 2:
                    recommendations.extend([
                        "😴 Establish a consistent bedtime routine to improve sleep quality",
                        "📱 Avoid screens 1 hour before bedtime for better rest",
                        "🛏️ Create a comfortable sleep environment - cool, dark, and quiet"
                    ])
                
                # Social-based recommendations
                if social_issues >= 2:
                    recommendations.extend([
                        "👥 Reach out to a friend or family member for a conversation",
                        "🤝 Consider joining a community group or activity that interests you",
                        "💌 Send a message to someone you care about - connection helps wellbeing"
                    ])
            
            # Mood-based recommendations
            if len(mood_entries) >= 5:
                recent_moods = mood_entries[:5]
                challenging_moods = [m for m in recent_moods if m.mood in ['😔', '😰', '😫', '😢', '😞']]
                
                if len(challenging_moods) >= 3:
                    recommendations.extend([
                        "🌱 Consider speaking with a mental health professional for additional support",
                        "💚 Practice self-compassion - be kind to yourself during difficult times",
                        "🎯 Focus on small, achievable goals to build momentum"
                    ])
                else:
                    recommendations.append("🌟 Great job maintaining emotional awareness - keep up the good work!")
            
            # General wellness recommendations
            general_recommendations = [
                "🙏 Practice gratitude by noting three things you're thankful for each day",
                "🚶 Take regular breaks and move your body throughout the day",
                "💧 Stay hydrated and maintain regular meal times",
                "📚 Engage in activities that bring you joy and fulfillment",
                "🌙 Maintain a regular sleep schedule for better mental health",
                "🎨 Try creative activities like drawing, music, or crafts for stress relief"
            ]
            
            # Add general recommendations if we don't have enough specific ones
            while len(recommendations) < 5:
                for rec in general_recommendations:
                    if rec not in recommendations:
                        recommendations.append(rec)
                        if len(recommendations) >= 5:
                            break
                break
            
            return {"recommendations": recommendations[:6]}  # Limit to 6 recommendations
    except Exception as e:
        print(f"Recommendations error: {e}")
        return {"recommendations": [
            "🌱 Focus on self-care and consider professional support if needed",
            "📊 Continue tracking your mood to better understand patterns",
            "💚 Practice self-compassion and be patient with your wellness journey"
        ]}
    try:
        with get_session() as session:
            journal_entries = session.query(JournalEntry).all()
            mood_entries = session.query(MoodLog).order_by(MoodLog.logged_date.desc()).all()
            
            recommendations = []
            
            # Basic tracking recommendations
            if len(journal_entries) < 3:
                recommendations.append("📝 Try journaling more frequently to gain better insights into your thoughts and feelings")
            
            if len(mood_entries) < 5:
                recommendations.append("📊 Log your mood daily using our detailed assessment to track emotional patterns")
            
            # Assessment-based recommendations
            assessment_entries = [e for e in mood_entries if e.note and "Assessment:" in e.note]
            
            if len(assessment_entries) >= 3:
                # Analyze recent assessments for personalized recommendations
                recent_assessments = assessment_entries[:5]
                energy_issues = 0
                stress_issues = 0
                sleep_issues = 0
                social_issues = 0
                
                for entry in recent_assessments:
                    if "Assessment:" in entry.note:
                        assessment_part = entry.note.split("Assessment:")[-1].strip()
                        try:
                            if "Energy: low" in assessment_part:
                                energy_issues += 1
                            if "Stress: high" in assessment_part:
                                stress_issues += 1
                            if "Sleep: poor" in assessment_part:
                                sleep_issues += 1
                            if "Social: isolated" in assessment_part:
                                social_issues += 1
                        except:
                            continue
                
                # Energy-based recommendations
                if energy_issues >= 2:
                    recommendations.extend([
                        "⚡ Consider light exercise or a short walk to boost energy levels",
                        "🍎 Focus on nutritious meals and stay hydrated throughout the day",
                        "☀️ Try to get some natural sunlight, especially in the morning"
                    ])
                
                # Stress-based recommendations
                if stress_issues >= 2:
                    recommendations.extend([
                        "🧘 Practice deep breathing exercises or meditation for 5-10 minutes daily",
                        "📝 Try writing down your worries to help process stressful thoughts",
                        "🎵 Listen to calming music or nature sounds when feeling overwhelmed"
                    ])
                
                # Sleep-based recommendations
                if sleep_issues >= 2:
                    recommendations.extend([
                        "😴 Establish a consistent bedtime routine to improve sleep quality",
                        "📱 Avoid screens 1 hour before bedtime for better rest",
                        "🛏️ Create a comfortable sleep environment - cool, dark, and quiet"
                    ])
                
                # Social-based recommendations
                if social_issues >= 2:
                    recommendations.extend([
                        "👥 Reach out to a friend or family member for a conversation",
                        "🤝 Consider joining a community group or activity that interests you",
                        "💌 Send a message to someone you care about - connection helps wellbeing"
                    ])
            
            # Mood-based recommendations
            if len(mood_entries) >= 5:
                recent_moods = mood_entries[:5]
                challenging_moods = [m for m in recent_moods if m.mood in ['😔', '😰', '😫', '😢', '😞']]
                
                if len(challenging_moods) >= 3:
                    recommendations.extend([
                        "🌱 Consider speaking with a mental health professional for additional support",
                        "💚 Practice self-compassion - be kind to yourself during difficult times",
                        "🎯 Focus on small, achievable goals to build momentum"
                    ])
                else:
                    recommendations.append("🌟 Great job maintaining emotional awareness - keep up the good work!")
            
            # General wellness recommendations
            general_recommendations = [
                "🙏 Practice gratitude by noting three things you're thankful for each day",
                "🚶 Take regular breaks and move your body throughout the day",
                "💧 Stay hydrated and maintain regular meal times",
                "📚 Engage in activities that bring you joy and fulfillment",
                "🌙 Maintain a regular sleep schedule for better mental health",
                "🎨 Try creative activities like drawing, music, or crafts for stress relief"
            ]
            
            # Add general recommendations if we don't have enough specific ones
            while len(recommendations) < 5:
                for rec in general_recommendations:
                    if rec not in recommendations:
                        recommendations.append(rec)
                        if len(recommendations) >= 5:
                            break
                break
            
            return {"recommendations": recommendations[:6]}  # Limit to 6 recommendations
    except Exception as e:
        print(f"Recommendations error: {e}")
        return {"recommendations": [
            "🌱 Focus on self-care and consider professional support if needed",
            "📊 Continue tracking your mood to better understand patterns",
            "💚 Practice self-compassion and be patient with your wellness journey"
        ]}

@router.post("/api/mood/cleanup-duplicates")
async def cleanup_duplicate_moods():
    """Remove duplicate mood entries, keeping only the most recent for each day"""
    try:
        with get_session() as session:
            # Get all mood entries grouped by date
            all_entries = session.query(MoodLog).order_by(MoodLog.logged_date, MoodLog.id.desc()).all()
            
            # Group by date and keep only the first (most recent) for each date
            seen_dates = set()
            entries_to_delete = []
            
            for entry in all_entries:
                if entry.logged_date in seen_dates:
                    entries_to_delete.append(entry)
                else:
                    seen_dates.add(entry.logged_date)
            
            # Delete duplicates
            for entry in entries_to_delete:
                session.delete(entry)
            
            session.commit()
            
            return {
                "message": f"Cleaned up {len(entries_to_delete)} duplicate entries",
                "deleted_count": len(entries_to_delete),
                "remaining_count": len(seen_dates)
            }
    except Exception as e:
        return {"error": f"Failed to cleanup duplicates: {str(e)}"}