import asyncio
import sys
import uuid
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import sys
import os

# Add parent dir to path so we can import 'app'
# This must be done BEFORE importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock database dependency
from app.db.session import AsyncSessionLocal
from app.services.auth_service import AuthService
from app.db.models.user import User
from app.db.models.otp import OTP
from sqlalchemy import select, delete

async def test_otp_generation():
    async with AsyncSessionLocal() as db:
        print("1. Fetching real user...")
        email = "munishupadhyay183@gmail.com"
        user = await AuthService.get_user_by_identifier(db, email)
        
        if not user:
            print(f"❌ User {email} not found!")
            return
            
        print(f"✅ User found: {user.id}")
        
        try:
            print("2. Calling generate_otp...")
            code = await AuthService.generate_otp(db, user.id)
            print(f"✅ OTP Generated: {code}")
            
            # Verify it's in DB
            result = await db.execute(select(OTP).where(OTP.user_id == user.id))
            otp_entry = result.scalars().first()
            if otp_entry:
                 print(f"✅ OTP found in DB. Hash: {otp_entry.otp_hash}")
            else:
                 print("❌ OTP not found in DB!")
            
            print("3. Testing create_temp_token...")
            from app.core.security import create_temp_token
            temp_token = create_temp_token(
                data={"sub": str(user.id), "stage": "otp_verification"}
            )
            print(f"✅ Temp Token Created: {temp_token[:20]}...")
            
        except Exception as e:
            print(f"❌ CRASHED: {e}")
            import traceback
            traceback.print_exc()
            
if __name__ == "__main__":
    asyncio.run(test_otp_generation())
