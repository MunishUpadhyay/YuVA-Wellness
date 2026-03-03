"""
OTP Model for 2-step authentication
"""
import uuid
from datetime import datetime, timedelta
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base

class OTP(Base):
    """One-Time Password model for 2FA"""
    __tablename__ = "otp_codes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    # Storing hashed value for security
    otp_hash: Mapped[str] = mapped_column(String, nullable=False)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    
    def is_valid(self) -> bool:
        """Check if OTP is valid (not used, not expired, attempts < 5)"""
        return not self.is_used and self.attempts < 5 and self.expires_at > datetime.utcnow()
