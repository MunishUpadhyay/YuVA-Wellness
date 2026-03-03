"""
Mood Log model for async SQLAlchemy
"""
import uuid
from datetime import date
from sqlalchemy import String, Numeric, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class MoodLog(Base):
    """Mood log model for tracking emotional states"""
    __tablename__ = "mood_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    mood: Mapped[str] = mapped_column(String, nullable=False, index=True)
    score: Mapped[float] = mapped_column(Numeric, nullable=False)
    logged_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
