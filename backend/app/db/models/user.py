"""
Authentication models for YuVA Wellness
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class User(Base):
    """
    Unified user model supporting both guest and registered users
    """
    __tablename__ = "users"

    # Unique client identifier (stored in cookie)
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        unique=True,
        index=True,
        comment="Unique client identifier stored in cookie"
    )
    
    # Authentication fields (null for guest users)
    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
        comment="Email address for registered users"
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        unique=True,
        index=True,
        comment="Phone number for registered users"
    )
    
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Hashed password for registered users"
    )

    # Authentication context
    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="local",
        comment="Authentication provider: local or google"
    )
    
    profile_picture: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Profile picture URL from social provider"
    )

    # Profile fields
    first_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="First name of the user"
    )
    
    last_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Last name of the user"
    )
    
    # User type and status flags
    is_guest: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
        comment="True for guest users, False for registered users"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Account active status"
    )
    
    # Timestamps
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self) -> str:
        user_type = "guest" if self.is_guest else "registered"
        identifier = self.email if self.email else str(self.client_id)[:8]
        return f"<User({user_type}): {identifier}>"
