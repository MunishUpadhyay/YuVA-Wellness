"""
Advanced AI Assistant Features for YuVA Wellness
"""
from __future__ import annotations

import json
import random
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional
from textblob import TextBlob

from ..models.db import get_session, JournalEntry, MoodLog
from .ml_analytics import analyze_sentiment


class AIWellnessAssistant:
    
    def __init__(self):
        self.personality_traits = {
            "empathy_level": 0.9,
            "supportiveness": 0.95,
            "professionalism": 0.8,
            "warmth": 0.85
        }
        
    async def generate_daily_insights(self, user_data: Dict) -> Dict[str, Any]:
        insights = {
            "mood_insight": await self._analyze_mood_patterns(user_data),
            "wellness_tip": self._get_personalized_wellness_tip(user_data),
            "progress_update": self._generate_progress_update(user_data),
            "recommended_actions": self._suggest_daily_actions(user_data),
            "mindfulness_moment": self._create_mindfulness_exercise(),
            "affirmation": self._generate_personal_affirmation(user_data)
        }
        
        return insights
    
    async def _analyze_mood_patterns(self, user_data: Dict) -> Dict[str, Any]:
        with get_session() as session:
            week_ago = date.today() - timedelta(days=7)
            recent_moods = session.query(MoodLog).filter(
                MoodLog.logged_date >= week_ago
            ).order_by(MoodLog.logged_date.desc()).all()
            
            if not recent_moods:
                return {
                    "pattern": "insufficient_data",
                    "message": "Start logging your moods to see personalized insights!",
                    "recommendation": "Try logging your mood daily for better patterns."
                }
            
            mood_values = {"😊": 4, "😐": 3, "😔": 2, "😫": 1, "🥰": 5, "😴": 2, "😰": 1, "😡": 1, "🤔": 3}
            values = [mood_values.get(mood.mood, 3) for mood in recent_moods]
            
            avg_mood = sum(values) / len(values)
            trend = "improving" if len(values) > 1 and values[0] > values[-1] else "stable"
            
            if avg_mood >= 3.5:
                return {
                    "pattern": "positive_trend",
                    "message": f"Your mood has been generally positive this week (avg: {avg_mood:.1f}/5)!",
                    "recommendation": "Keep up the great work! Consider what's been helping you feel good.",
                    "trend": trend
                }
            elif avg_mood >= 2.5:
                return {
                    "pattern": "neutral_trend", 
                    "message": f"Your mood has been balanced this week (avg: {avg_mood:.1f}/5).",
                    "recommendation": "Try incorporating more activities that bring you joy.",
                    "trend": trend
                }
            else:
                return {
                    "pattern": "needs_attention",
                    "message": f"Your mood has been lower than usual (avg: {avg_mood:.1f}/5).",
                    "recommendation": "Consider reaching out to someone you trust or trying some self-care activities.",
                    "trend": trend
                }
    
    def _get_personalized_wellness_tip(self, user_data: Dict) -> Dict[str, str]:
        tips_by_category = {
            "stress_management": [
                "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8.",
                "Take a 5-minute walk outside to reset your mind and body.",
                "Practice progressive muscle relaxation starting from your toes."
            ],
            "mood_boosting": [
                "Listen to your favorite uplifting song and really focus on the lyrics.",
                "Write down three things you're grateful for today, no matter how small.",
                "Do something kind for someone else - it naturally boosts your mood."
            ],
            "sleep_hygiene": [
                "Create a wind-down routine 30 minutes before bed without screens.",
                "Keep your bedroom cool (65-68°F) for optimal sleep quality.",
                "Try the 'body scan' meditation to relax before sleep."
            ],
            "mindfulness": [
                "Practice the 5-4-3-2-1 grounding technique when feeling overwhelmed.",
                "Take three conscious breaths before starting any new task today.",
                "Notice one beautiful thing around you right now and appreciate it fully."
            ],
            "social_connection": [
                "Send a thoughtful message to someone you care about.",
                "Schedule a coffee date or call with a friend this week.",
                "Join a community group or activity that interests you."
            ]
        }
        
        category = random.choice(list(tips_by_category.keys()))
        tip = random.choice(tips_by_category[category])
        
        return {
            "category": category.replace("_", " ").title(),
            "tip": tip,
            "difficulty": "easy"
        }
    
    def _generate_progress_update(self, user_data: Dict) -> Dict[str, Any]:
        """Generate progress updates and achievements"""
        
        with get_session() as session:
            # Count total entries
            total_moods = session.query(MoodLog).count()
            total_journals = session.query(JournalEntry).count()
            
            # Calculate streaks
            mood_streak = self._calculate_mood_streak()
            
            achievements = []
            if total_moods >= 7:
                achievements.append("Week Warrior - 7 days of mood tracking!")
            if total_moods >= 30:
                achievements.append("Monthly Master - 30 days of consistent tracking!")
            if total_journals >= 5:
                achievements.append("Reflection Rookie - 5 journal entries!")
            if mood_streak >= 3:
                achievements.append(f"Streak Star - {mood_streak} days in a row!")
            
            return {
                "total_mood_logs": total_moods,
                "total_journal_entries": total_journals,
                "current_streak": mood_streak,
                "achievements": achievements,
                "next_milestone": self._get_next_milestone(total_moods, total_journals)
            }
    
    def _calculate_mood_streak(self) -> int:
        """Calculate current mood logging streak"""
        
        with get_session() as session:
            current_date = date.today()
            streak = 0
            
            for i in range(30):  # Check last 30 days
                check_date = current_date - timedelta(days=i)
                mood_exists = session.query(MoodLog).filter(
                    MoodLog.logged_date == check_date
                ).first()
                
                if mood_exists:
                    streak += 1
                else:
                    break
            
            return streak
    
    def _get_next_milestone(self, moods: int, journals: int) -> Dict[str, Any]:
        """Get the next achievement milestone"""
        
        mood_milestones = [7, 14, 30, 60, 100]
        journal_milestones = [5, 10, 25, 50]
        
        next_mood = next((m for m in mood_milestones if m > moods), 365)
        next_journal = next((j for j in journal_milestones if j > journals), 100)
        
        if next_mood <= next_journal:
            return {
                "type": "mood_tracking",
                "target": next_mood,
                "current": moods,
                "remaining": next_mood - moods,
                "message": f"Log {next_mood - moods} more moods to reach your next milestone!"
            }
        else:
            return {
                "type": "journaling",
                "target": next_journal,
                "current": journals,
                "remaining": next_journal - journals,
                "message": f"Write {next_journal - journals} more journal entries for your next achievement!"
            }
    
    def _suggest_daily_actions(self, user_data: Dict) -> List[Dict[str, str]]:
        """Suggest personalized daily actions"""
        
        actions = [
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
            },
            {
                "action": "Listen to calming music",
                "duration": "10 minutes",
                "benefit": "Reduces anxiety and promotes relaxation",
                "icon": "🎵"
            },
            {
                "action": "Do gentle stretches",
                "duration": "5 minutes",
                "benefit": "Releases physical tension and improves mood",
                "icon": "🧘"
            }
        ]
        
        # Return 3 random suggestions
        return random.sample(actions, 3)
    
    def _create_mindfulness_exercise(self) -> Dict[str, str]:
        """Create a personalized mindfulness exercise"""
        
        exercises = [
            {
                "name": "5-4-3-2-1 Grounding",
                "instruction": "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
                "duration": "3-5 minutes",
                "benefit": "Brings you into the present moment"
            },
            {
                "name": "Box Breathing",
                "instruction": "Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times.",
                "duration": "2-3 minutes", 
                "benefit": "Calms the nervous system"
            },
            {
                "name": "Body Scan",
                "instruction": "Starting from your toes, slowly notice each part of your body, releasing any tension you find.",
                "duration": "5-10 minutes",
                "benefit": "Promotes relaxation and body awareness"
            },
            {
                "name": "Loving Kindness",
                "instruction": "Send kind thoughts to yourself, then to loved ones, then to all beings: 'May you be happy, may you be peaceful.'",
                "duration": "5-7 minutes",
                "benefit": "Increases compassion and positive emotions"
            }
        ]
        
        return random.choice(exercises)
    
    def _generate_personal_affirmation(self, user_data: Dict) -> Dict[str, str]:
        """Generate personalized affirmations"""
        
        affirmations = [
            {
                "text": "I am worthy of love, care, and respect - especially from myself.",
                "theme": "self_worth"
            },
            {
                "text": "Every small step I take toward wellness matters and makes a difference.",
                "theme": "progress"
            },
            {
                "text": "I have the strength to handle whatever today brings me.",
                "theme": "resilience"
            },
            {
                "text": "My feelings are valid, and it's okay to experience them fully.",
                "theme": "emotional_acceptance"
            },
            {
                "text": "I choose to be patient and kind with myself as I grow and heal.",
                "theme": "self_compassion"
            },
            {
                "text": "I am not alone in my journey, and it's okay to ask for help.",
                "theme": "connection"
            }
        ]
        
        return random.choice(affirmations)
    
    async def analyze_journal_sentiment(self, content: str) -> Dict[str, Any]:
        """Analyze journal entry sentiment and provide insights"""
        
        sentiment = analyze_sentiment(content)
        
        # Generate contextual response based on sentiment
        if sentiment["polarity"] > 0.3:
            response = {
                "sentiment": "positive",
                "message": "Your writing reflects positive emotions and thoughts. This is wonderful to see!",
                "suggestion": "Consider what contributed to these positive feelings so you can nurture more of them.",
                "color": "#00b894"
            }
        elif sentiment["polarity"] < -0.3:
            response = {
                "sentiment": "challenging",
                "message": "It sounds like you're going through a difficult time. Thank you for sharing these feelings.",
                "suggestion": "Remember that difficult emotions are temporary. Consider reaching out to someone you trust.",
                "color": "#fd79a8"
            }
        else:
            response = {
                "sentiment": "neutral",
                "message": "Your writing shows a balanced emotional state with mixed feelings.",
                "suggestion": "This kind of emotional balance is natural. Keep reflecting on your experiences.",
                "color": "#74b9ff"
            }
        
        response.update({
            "polarity": sentiment["polarity"],
            "subjectivity": sentiment["subjectivity"],
            "word_count": len(content.split()),
            "reading_time": f"{max(1, len(content.split()) // 200)} min read"
        })
        
        return response
    
    async def generate_wellness_plan(self, user_preferences: Dict) -> Dict[str, Any]:
        """Generate a personalized wellness plan"""
        
        plan = {
            "daily_goals": [
                "Log your mood once per day",
                "Take 3 conscious deep breaths",
                "Write one sentence about your day"
            ],
            "weekly_goals": [
                "Complete 2-3 journal entries",
                "Try one new mindfulness exercise",
                "Connect with a friend or family member"
            ],
            "monthly_goals": [
                "Review your mood patterns",
                "Set one new wellness intention",
                "Celebrate your progress"
            ],
            "emergency_toolkit": [
                "Call a trusted friend: [Your emergency contact]",
                "Use the 5-4-3-2-1 grounding technique",
                "Take slow, deep breaths for 2 minutes",
                "Go to your safe space or comfort area"
            ],
            "resources": [
                "Crisis Text Line: Text HOME to 741741",
                "National Suicide Prevention Lifeline: 988",
                "Your local emergency services: 911"
            ]
        }
        
        return plan
    
    def get_conversation_starters(self) -> List[Dict[str, str]]:
        """Get conversation starters for the AI chat"""
        
        starters = [
            {
                "text": "How are you feeling today?",
                "category": "check_in",
                "icon": "💭"
            },
            {
                "text": "What's been on your mind lately?",
                "category": "reflection",
                "icon": "🤔"
            },
            {
                "text": "Tell me about something good that happened recently",
                "category": "positive",
                "icon": "😊"
            },
            {
                "text": "What's been challenging for you?",
                "category": "support",
                "icon": "🤗"
            },
            {
                "text": "What would help you feel better right now?",
                "category": "coping",
                "icon": "💪"
            },
            {
                "text": "How has your sleep been?",
                "category": "wellness",
                "icon": "😴"
            }
        ]
        
        return starters


# Global AI assistant instance
ai_assistant = AIWellnessAssistant()