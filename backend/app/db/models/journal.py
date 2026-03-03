"""
Journal Entry model for async SQLAlchemy
"""
import uuid
from datetime import date
from sqlalchemy import String, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class JournalEntry(Base):
    """Journal entry model for user reflections"""
    __tablename__ = "journal_entries"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
