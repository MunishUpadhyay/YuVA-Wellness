from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.user import User
from app.db.models.chat import Conversation, Message
from app.api.deps import get_current_user, get_db
from app.services.safety import detect_crisis
from app.services.llm import EnhancedGenerativeAIClient

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize the Gemini API client
ai_client = EnhancedGenerativeAIClient()

class ChatMessage(BaseModel):
    text: str

class ChatResponse(BaseModel):
    reply: str
    type: str
    confidence: float

@router.post("/chat", response_model=ChatResponse)
async def chat_with_companion(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Open Chat endpoint for the YuVA Companion.
    Includes deterministic crisis detection before forwarding to Gemini.
    Returns structured JSON responses as mandated by the implementation plan.
    """
    user_text = message.text.strip()
    
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 1. Deterministic Crisis Detection Layer
    is_crisis = detect_crisis(user_text)
    
    # Get or create active conversation
    result = await db.execute(
        select(Conversation).where(
            Conversation.user_id == current_user.id,
            Conversation.is_active == True
        ).order_by(Conversation.created_at.desc()).limit(1)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        conversation = Conversation(user_id=current_user.id, title="Open Chat")
        db.add(conversation)
        await db.flush()  # get the ID

    # Always save the user's message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=user_text,
        message_type="normal"
    )
    db.add(user_msg)
    await db.flush()  # get the message ID

    if is_crisis:
        logger.warning(f"Crisis detected for user {current_user.id}")
        
        reply_text = "I'm very concerned about what you've shared. You are not alone, and help is available right now. Please reach out to one of these free, confidential resources immediately:\n\n**National Suicide Prevention Lifeline:** 988\n**Crisis Text Line:** Text HOME to 741741\n**Emergency Services:** 911\n\nYour life has value. Please talk to someone who can provide immediate professional support."
        
        # Save structured crisis support response (Skip Gemini)
        ai_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=reply_text,
            message_type="crisis",
            confidence=1.0
        )
        db.add(ai_msg)
        await db.commit()
        
        return ChatResponse(
            reply=reply_text,
            type="crisis",
            confidence=1.0
        )

    # 2. Forward to Gemini if safe
    try:
        # Retrieve past conversation history for context (last 10 messages)
        msg_result = await db.execute(
            select(Message).where(
                Message.conversation_id == conversation.id
            ).order_by(Message.created_at.asc())
        )
        history = msg_result.scalars().all()
        
        # Keep recent context (last 10 turns = 20 messages)
        recent_history = history[-20:]
        
        # Format the message history for the LLM
        gemini_messages = [{"role": m.role, "content": m.content} for m in recent_history]
        
        gemini_response_text = await ai_client.chat(gemini_messages)
        
        # Save AI Reply
        ai_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=gemini_response_text,
            message_type="normal",
            confidence=0.9
        )
        db.add(ai_msg)
        await db.commit()
        
        # 3. Structured Output Response
        return ChatResponse(
            reply=gemini_response_text,
            type="normal",
            confidence=0.9
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error communicating with AI: {str(e)}")
        await db.rollback()
        # Graceful fallback instead of raw error
        return ChatResponse(
            reply="I'm experiencing a bit of trouble finding the right words right now, but I am still here. Could you try sending your message again?",
            type="error",
            confidence=0.0
        )
