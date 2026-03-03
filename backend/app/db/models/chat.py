import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base

class Conversation(Base):
    """
    Represents a chat session with the AI companion.
    """
    __tablename__ = "conversations"

    # User who owns this conversation
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Optional title for the conversation (could be auto-generated later)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Active flag (for logical deletion or archiving)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationship to messages
    messages: Mapped[List["Message"]] = relationship(
        "Message", 
        back_populates="conversation", 
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )

class Message(Base):
    """
    Represents a single message in a conversation.
    """
    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # 'user' or 'assistant'
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # The actual text content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # For AI responses: normal, crisis, error, etc.
    message_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # For AI responses: confidence score
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationship back to conversation
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", 
        back_populates="messages"
    )
