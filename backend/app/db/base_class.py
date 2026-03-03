"""
Database base configuration
"""
import uuid
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID

class Base(DeclarativeBase):
    """Base class for all database models"""
    
    # UUID primary key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )
    
    # Timezone-aware created_at timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

# Metadata for migrations
metadata = Base.metadata