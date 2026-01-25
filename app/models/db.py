from sqlmodel import SQLModel, Field, create_engine, Session
from datetime import datetime, date
from typing import Optional

class JournalEntry(SQLModel, table=True):
    __tablename__ = "journal_entries"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = ""
    content: str = ""
    entry_date: str = ""
    created_at: str = ""

class MoodLog(SQLModel, table=True):
    __tablename__ = "mood_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    mood: str = ""
    note: str = ""
    logged_date: str = ""
    created_at: str = ""

# Create engine with proper UTF-8 encoding support
engine = create_engine(
    "sqlite:///./yuva.db",
    connect_args={"check_same_thread": False},
    echo=False
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)