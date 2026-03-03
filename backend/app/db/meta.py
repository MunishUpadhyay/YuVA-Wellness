# Base class
from app.db.base_class import Base

# Import all models here for Alembic
from app.db.models.user import User
from app.db.models.otp import OTP
from app.db.models.mood import MoodLog
from app.db.models.journal import JournalEntry
from app.db.models.assessment import AssessmentResult
