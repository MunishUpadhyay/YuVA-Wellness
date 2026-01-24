"""
Simplified ML Analytics Service
Lightweight version for basic sentiment analysis and mood tracking
"""
from __future__ import annotations

from typing import List, Dict, Any
from textblob import TextBlob


def analyze_sentiment(text: str) -> Dict[str, Any]:
    """Basic sentiment analysis using TextBlob"""
    if not text or not text.strip():
        return {"polarity": 0.0, "subjectivity": 0.0, "sentiment": "neutral"}
    
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "sentiment": sentiment
    }


def analyze_mood_patterns(entries: List[Dict]) -> Dict[str, Any]:
    """Simple mood pattern analysis"""
    if not entries:
        return {"trend": "No data", "description": "No entries available"}
    
    # Count sentiment patterns
    sentiments = []
    for entry in entries:
        content = entry.get("content", "")
        if content:
            sentiment = analyze_sentiment(content)
            sentiments.append(sentiment["polarity"])
    
    if not sentiments:
        return {"trend": "No data", "description": "No text content to analyze"}
    
    avg_sentiment = sum(sentiments) / len(sentiments)
    
    if avg_sentiment > 0.1:
        trend = "Positive"
        description = "Your journal entries show generally positive sentiment"
    elif avg_sentiment < -0.1:
        trend = "Negative"
        description = "Your journal entries show some negative sentiment patterns"
    else:
        trend = "Neutral"
        description = "Your journal entries show balanced sentiment"
    
    return {
        "trend": trend,
        "description": description,
        "average_sentiment": avg_sentiment
    }


def get_personalized_recommendations(entries: List[Dict]) -> List[str]:
    """Generate simple recommendations based on entries"""
    if not entries:
        return ["Start journaling regularly to get personalized recommendations"]
    
    recommendations = []
    
    # Analyze recent sentiment
    recent_entries = entries[:5]  # Last 5 entries
    sentiments = []
    
    for entry in recent_entries:
        content = entry.get("content", "")
        if content:
            sentiment = analyze_sentiment(content)
            sentiments.append(sentiment["polarity"])
    
    if sentiments:
        avg_recent = sum(sentiments) / len(sentiments)
        
        if avg_recent < -0.2:
            recommendations.extend([
                "Consider practicing gratitude journaling",
                "Try mindfulness or meditation exercises",
                "Reach out to friends or family for support"
            ])
        elif avg_recent > 0.2:
            recommendations.extend([
                "Keep up the positive momentum!",
                "Share your positive experiences with others",
                "Consider helping others to maintain your wellbeing"
            ])
        else:
            recommendations.extend([
                "Continue your regular journaling practice",
                "Try setting small daily wellness goals",
                "Practice self-reflection and mindfulness"
            ])
    
    # General recommendations
    if len(entries) < 5:
        recommendations.append("Try to journal more frequently for better insights")
    
    if len(entries) >= 10:
        recommendations.append("Great job maintaining your wellness routine!")
    
    return recommendations[:5]  # Limit to 5 recommendations


# Simple function aliases for backward compatibility
sentiment_analyzer = analyze_sentiment
mood_pattern_analyzer = analyze_mood_patterns
personalized_recommender = get_personalized_recommendations