from __future__ import annotations

from typing import List, Dict, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
import json

from ..services.llm import EnhancedGenerativeAIClient
from ..services.safety import detect_crisis, get_crisis_message
from ..security import check_rate_limit, chat_limiter, sanitize_input

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")
llm_client = EnhancedGenerativeAIClient()


@router.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})


@router.post("/api/chat/stream")
async def chat_stream_api(request: Request, payload: Dict[str, List[Dict[str, str]] | Optional[str]]):
    """Streaming chat endpoint for real-time responses"""
    # Check rate limit
    remaining = check_rate_limit(request, chat_limiter)
    
    messages = payload.get("messages", [])  # type: ignore
    lang = payload.get("lang", "en")  # type: ignore
    
    if not isinstance(messages, list) or not messages:
        raise HTTPException(status_code=400, detail="messages must be a non-empty list")

    # Sanitize input messages
    sanitized_messages = []
    for msg in messages:
        if isinstance(msg, dict) and "content" in msg:
            sanitized_content = sanitize_input(msg["content"], max_length=2000)
            sanitized_messages.append({
                "role": msg.get("role", "user"),
                "content": sanitized_content
            })

    # Crisis check on latest user message
    latest_user = next((m.get("content", "") for m in reversed(sanitized_messages) if m.get("role") == "user"), "")
    crisis_detected = detect_crisis(latest_user)
    
    if crisis_detected:
        # For crisis situations, return immediate non-streaming response
        safety = get_crisis_message()
        supportive = await llm_client.chat(sanitized_messages)
        crisis_response = {
            "reply": f"{safety}\n\n{supportive}", 
            "crisis": True,
            "rate_limit_remaining": remaining,
            "message_id": f"msg_{len(sanitized_messages)}_{hash(latest_user) % 10000}",
            "timestamp": datetime.utcnow().isoformat(),
            "streaming": False
        }
        return StreamingResponse(
            iter([f"data: {json.dumps(crisis_response)}\n\n"]),
            media_type="text/plain"
        )

    # Add language context for better responses
    if isinstance(lang, str) and lang == "hi-en":
        sanitized_messages = sanitized_messages + [{
            "role": "system", 
            "content": "Please respond in a mix of English and Hindi (Hinglish) in a natural, conversational way. Use Hindi words that feel natural and add warmth to the conversation."
        }]

    async def generate_stream():
        """Generate streaming response"""
        try:
            # Send initial metadata
            metadata = {
                "type": "metadata",
                "crisis": False,
                "rate_limit_remaining": remaining,
                "message_id": f"msg_{len(sanitized_messages)}_{hash(latest_user) % 10000}",
                "timestamp": datetime.utcnow().isoformat(),
                "streaming": True
            }
            yield f"data: {json.dumps(metadata)}\n\n"
            
            # Stream the AI response
            full_response = ""
            async for chunk in llm_client.chat_stream(sanitized_messages):
                full_response += chunk
                chunk_data = {
                    "type": "chunk",
                    "content": chunk
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
            
            # Send completion signal with enhanced response
            enhanced_reply = enhance_response(full_response, latest_user, lang)
            completion_data = {
                "type": "complete",
                "full_response": enhanced_reply,
                "suggestions": get_follow_up_suggestions(latest_user, lang)
            }
            yield f"data: {json.dumps(completion_data)}\n\n"
            
        except Exception as e:
            # Send error in streaming format
            error_data = {
                "type": "error",
                "error": "I'm having trouble connecting right now, but I'm still here with you. Please try again in a moment."
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(generate_stream(), media_type="text/plain")


@router.post("/api/chat")
async def chat_api(request: Request, payload: Dict[str, List[Dict[str, str]] | Optional[str]]):
    # Check rate limit
    remaining = check_rate_limit(request, chat_limiter)
    
    messages = payload.get("messages", [])  # type: ignore
    lang = payload.get("lang", "en")  # type: ignore
    
    if not isinstance(messages, list) or not messages:
        raise HTTPException(status_code=400, detail="messages must be a non-empty list")

    # Sanitize input messages
    sanitized_messages = []
    for msg in messages:
        if isinstance(msg, dict) and "content" in msg:
            sanitized_content = sanitize_input(msg["content"], max_length=2000)
            sanitized_messages.append({
                "role": msg.get("role", "user"),
                "content": sanitized_content
            })

    # Crisis check on latest user message
    latest_user = next((m.get("content", "") for m in reversed(sanitized_messages) if m.get("role") == "user"), "")
    crisis_detected = detect_crisis(latest_user)
    
    if crisis_detected:
        safety = get_crisis_message()
        supportive = await llm_client.chat(sanitized_messages)
        return {
            "reply": f"{safety}\n\n{supportive}", 
            "crisis": True,
            "rate_limit_remaining": remaining,
            "message_id": f"msg_{len(sanitized_messages)}_{hash(latest_user) % 10000}",
            "timestamp": datetime.utcnow().isoformat()
        }

    # Add language context for better responses
    if isinstance(lang, str) and lang == "hi-en":
        sanitized_messages = sanitized_messages + [{
            "role": "system", 
            "content": "Please respond in a mix of English and Hindi (Hinglish) in a natural, conversational way. Use Hindi words that feel natural and add warmth to the conversation."
        }]

    # Get AI response
    reply = await llm_client.chat(sanitized_messages)
    
    # Add some personality and engagement
    enhanced_reply = enhance_response(reply, latest_user, lang)
    
    return {
        "reply": enhanced_reply, 
        "crisis": False,
        "rate_limit_remaining": remaining,
        "message_id": f"msg_{len(sanitized_messages)}_{hash(latest_user) % 10000}",
        "timestamp": datetime.utcnow().isoformat(),
        "suggestions": get_follow_up_suggestions(latest_user, lang)
    }


def enhance_response(reply: str, user_message: str, lang: str) -> str:
    """Add personality and engagement to AI responses"""
    
    # Add empathetic acknowledgments
    empathy_starters = [
        "I hear you, and what you're sharing takes courage.",
        "Thank you for trusting me with this.",
        "I can sense this is important to you.",
        "Your feelings are completely valid.",
    ]
    
    # Add encouraging endings
    encouraging_endings = [
        "You're taking positive steps by reaching out.",
        "Remember, you don't have to face this alone.",
        "I'm here whenever you need to talk.",
        "You're stronger than you know.",
    ]
    
    # Detect if response needs enhancement
    if len(reply.split()) < 20:  # Short responses get more personality
        if any(word in user_message.lower() for word in ['sad', 'depressed', 'down', 'upset']):
            starter = empathy_starters[hash(user_message) % len(empathy_starters)]
            reply = f"{starter} {reply}"
        
        if not reply.endswith(('?', '!', '.')):
            ending = encouraging_endings[hash(user_message) % len(encouraging_endings)]
            reply = f"{reply} {ending}"
    
    return reply


def get_follow_up_suggestions(user_message: str, lang: str) -> List[str]:
    """Generate contextual follow-up suggestions"""
    
    suggestions = []
    message_lower = user_message.lower()
    
    # Emotion-based suggestions
    if any(word in message_lower for word in ['anxious', 'anxiety', 'worried', 'nervous']):
        suggestions = [
            "Can you tell me more about what's making you feel anxious?",
            "Would you like to try a breathing exercise together?",
            "What usually helps you when you feel this way?"
        ]
    elif any(word in message_lower for word in ['sad', 'depressed', 'down', 'lonely']):
        suggestions = [
            "What's been weighing on your mind lately?",
            "Is there someone you feel comfortable talking to?",
            "What's one small thing that usually brings you comfort?"
        ]
    elif any(word in message_lower for word in ['stress', 'stressed', 'overwhelmed', 'pressure']):
        suggestions = [
            "What's the biggest source of stress for you right now?",
            "How do you usually handle stressful situations?",
            "Would it help to break down what you're dealing with?"
        ]
    elif any(word in message_lower for word in ['happy', 'good', 'great', 'excited', 'joy']):
        suggestions = [
            "That's wonderful! What's making you feel so positive?",
            "I'd love to hear more about what's going well!",
            "How can you carry this positive energy forward?"
        ]
    else:
        # General suggestions
        suggestions = [
            "How has your day been overall?",
            "What's one thing you're grateful for today?",
            "Is there anything specific you'd like to talk about?"
        ]
    
    # Limit to 3 suggestions
    return suggestions[:3]