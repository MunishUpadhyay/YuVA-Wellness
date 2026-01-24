from __future__ import annotations

import re
import warnings
from typing import Optional, Dict, List, Tuple
from datetime import datetime, timedelta

# Suppress warnings
warnings.filterwarnings('ignore')

# Crisis patterns
CRISIS_PATTERNS = [
    re.compile(r"\b(suicide|kill myself|end my life|self harm)\b", re.I),
    re.compile(r"\b(hopeless|helpless|no point|give up)\b", re.I),
    re.compile(r"\b(want to die|wish i was dead)\b", re.I),
    re.compile(r"\b(can't take it anymore|end it all)\b", re.I),
]

def detect_crisis(text: str) -> bool:
    """Detect if text contains crisis indicators"""
    if not text:
        return False
    
    text_lower = text.lower()
    
    for pattern in CRISIS_PATTERNS:
        if pattern.search(text_lower):
            return True
    
    return False

def get_crisis_message() -> str:
    """Get crisis intervention message"""
    return """
    <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
        <h3 style="color: #d32f2f; margin-top: 0;">🆘 Crisis Support Available</h3>
        <p><strong>You are not alone.</strong> If you're having thoughts of self-harm, please reach out for help immediately.</p>
        <p><strong>Emergency Resources:</strong></p>
        <ul>
            <li><strong>National Suicide Prevention Lifeline:</strong> 988</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            <li><strong>Emergency Services:</strong> 911</li>
        </ul>
        <p>These services are available 24/7 and are free and confidential.</p>
    </div>
    """

def analyze_risk_level(entries: List[Dict]) -> str:
    """Analyze overall risk level from entries"""
    if not entries:
        return "low"
    
    crisis_count = 0
    total_entries = len(entries)
    
    for entry in entries:
        content = entry.get('content', '')
        if detect_crisis(content):
            crisis_count += 1
    
    crisis_ratio = crisis_count / total_entries if total_entries > 0 else 0
    
    if crisis_ratio > 0.3:
        return "high"
    elif crisis_ratio > 0.1:
        return "medium"
    else:
        return "low"

def get_risk_factors(entries: List[Dict]) -> List[str]:
    """Get risk factors from entries"""
    risk_factors = []
    
    if not entries:
        return risk_factors
    
    for entry in entries:
        content = entry.get('content', '')
        if detect_crisis(content):
            risk_factors.append("Crisis indicators detected")
            break
    
    return risk_factors