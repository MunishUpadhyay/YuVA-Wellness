"""
Assessment Result model for async SQLAlchemy
"""
import uuid
from typing import Optional
from sqlalchemy import String, Text, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class AssessmentResult(Base):
    """Assessment results for wellness evaluations"""
    __tablename__ = "assessment_results"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    assessment_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    responses: Mapped[str] = mapped_column(Text, nullable=False, comment="JSON/text responses")
    score: Mapped[Optional[float]] = mapped_column(Numeric, nullable=True)
