"""
Journal API Router
"""
import uuid
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.db.models.journal import JournalEntry
from app.db.models.user import User
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


class JournalCreate(BaseModel):
    title: str
    content: str
    entry_date: Optional[date] = None


class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    entry_date: Optional[date] = None


class JournalResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    entry_date: date
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/journal", response_model=List[JournalResponse])
async def get_journal_entries(
    limit: int = 20, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get journal entries for current user"""
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.entry_date.desc())
        .limit(limit)
    )
    entries = result.scalars().all()
    return entries


@router.post("/journal", response_model=JournalResponse)
async def create_journal_entry(
    entry_data: JournalCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new journal entry for current user"""
    entry = JournalEntry(
        user_id=current_user.id,
        title=entry_data.title,
        content=entry_data.content,
        entry_date=entry_data.entry_date or date.today()
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/journal/{entry_id}", response_model=JournalResponse)
async def get_journal_entry(
    entry_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific journal entry for current user"""
    entry = await db.get(JournalEntry, entry_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.put("/journal/{entry_id}", response_model=JournalResponse)
async def update_journal_entry(
    entry_id: uuid.UUID, 
    entry_data: JournalUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update journal entry for current user"""
    entry = await db.get(JournalEntry, entry_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    if entry_data.title is not None:
        entry.title = entry_data.title
    if entry_data.content is not None:
        entry.content = entry_data.content
    if entry_data.entry_date is not None:
        entry.entry_date = entry_data.entry_date
        
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(
    entry_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete journal entry for current user"""
    entry = await db.get(JournalEntry, entry_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await db.delete(entry)
    await db.commit()
    return {"message": "Journal entry deleted successfully"}