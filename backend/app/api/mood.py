"""
Mood Tracking API Router
"""
import uuid
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.db.models.mood import MoodLog
from app.db.models.user import User
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


class MoodCreate(BaseModel):
    mood: str
    score: float
    logged_date: Optional[date] = None


class MoodResponse(BaseModel):
    id: uuid.UUID
    mood: str
    score: float
    logged_date: date
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/moods", response_model=List[MoodResponse])
async def get_moods(
    limit: int = 30, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get mood logs for current user"""
    result = await db.execute(
        select(MoodLog)
        .where(MoodLog.user_id == current_user.id)
        .order_by(MoodLog.logged_date.desc())
        .limit(limit)
    )
    moods = result.scalars().all()
    return moods


@router.post("/moods", response_model=MoodResponse)
async def create_mood(
    mood_data: MoodCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new mood log for current user"""
    mood_log = MoodLog(
        user_id=current_user.id,
        mood=mood_data.mood,
        score=mood_data.score,
        logged_date=mood_data.logged_date or date.today()
    )
    db.add(mood_log)
    await db.commit()
    await db.refresh(mood_log)
    return mood_log


@router.get("/moods/{mood_id}", response_model=MoodResponse)
async def get_mood(
    mood_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific mood log for current user"""
    mood = await db.get(MoodLog, mood_id)
    if not mood or mood.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mood log not found")
    return mood


@router.delete("/moods/{mood_id}")
async def delete_mood(
    mood_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete mood log for current user"""
    mood = await db.get(MoodLog, mood_id)
    if not mood or mood.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Mood log not found")
    
    await db.delete(mood)
    await db.commit()
    return {"message": "Mood log deleted"}