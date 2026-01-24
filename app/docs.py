"""
API Documentation and Examples
"""

# API Examples for documentation
CHAT_EXAMPLE = {
    "messages": [
        {"role": "user", "content": "I'm feeling anxious about my upcoming exam"}
    ],
    "lang": "en"
}

JOURNAL_EXAMPLE = {
    "title": "My Daily Reflection",
    "content": "Today was challenging but I learned something new about myself...",
    "entry_date": "2024-01-22"
}

MOOD_EXAMPLE = {
    "mood": "😊",
    "note": "Had a great day with friends"
}

# API Response Examples
CHAT_RESPONSE_EXAMPLE = {
    "reply": "I understand that exam anxiety can be overwhelming. It's completely normal to feel this way...",
    "crisis": False,
    "rate_limit_remaining": 45
}

ANALYTICS_RESPONSE_EXAMPLE = {
    "summary": {
        "total_journal_entries": 25,
        "total_mood_logs": 40,
        "recent_journals": 5,
        "recent_moods": 7
    },
    "mood_distribution": {
        "😊": 15,
        "😐": 12,
        "😔": 8,
        "😫": 5
    },
    "activity_streak": 7,
    "last_updated": "2024-01-22T10:30:00"
}

# Tags for API organization
TAGS_METADATA = [
    {
        "name": "health",
        "description": "Health check and system status endpoints"
    },
    {
        "name": "chat",
        "description": "AI chat and conversation endpoints"
    },
    {
        "name": "journal",
        "description": "Journal entry management"
    },
    {
        "name": "mood",
        "description": "Mood tracking and logging"
    },
    {
        "name": "analytics",
        "description": "Data analytics and insights"
    },
    {
        "name": "export",
        "description": "Data export functionality"
    }
]