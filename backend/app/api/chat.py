"""
Assessment API Router
"""
import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import json

from app.db.models.assessment import AssessmentResult
from app.db.models.user import User
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


class AssessmentRequest(BaseModel):
    responses: Dict[str, Any]
    assessment_type: str = "wellness"


class AssessmentResponse(BaseModel):
    id: uuid.UUID
    assessment_type: str
    score: float
    recommendations: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/assessment", response_model=AssessmentResponse)
async def submit_assessment(
    assessment_data: AssessmentRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit wellness assessment for current user"""
    
    # Calculate score based on responses
    score = calculate_wellness_score(assessment_data.responses)
    
    # Generate recommendations
    recommendations = generate_recommendations(score, assessment_data.responses)
    
    result = AssessmentResult(
        user_id=current_user.id,
        assessment_type=assessment_data.assessment_type,
        responses=json.dumps(assessment_data.responses),
        score=score
    )
    db.add(result)
    await db.commit()
    await db.refresh(result)
    
    return AssessmentResponse(
        id=result.id,
        assessment_type=result.assessment_type,
        score=result.score or 0.0,
        recommendations=recommendations,
        created_at=result.created_at
    )


@router.get("/assessment/history", response_model=List[AssessmentResponse])
async def get_assessment_history(
    limit: int = 10, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get assessment history for current user"""
    result = await db.execute(
        select(AssessmentResult)
        .where(AssessmentResult.user_id == current_user.id)
        .order_by(AssessmentResult.created_at.desc())
        .limit(limit)
    )
    results = result.scalars().all()
    
    response_list = []
    for result in results:
        try:
            responses = json.loads(result.responses) if result.responses else {}
            recommendations = generate_recommendations(result.score or 0.0, responses)
        except:
            recommendations = {"message": "Unable to generate recommendations"}
            
        response_list.append(AssessmentResponse(
            id=result.id,
            assessment_type=result.assessment_type,
            score=result.score or 0.0,
            recommendations=recommendations,
            created_at=result.created_at
        ))
    
    return response_list


def calculate_wellness_score(responses: Dict[str, Any]) -> float:
    """Calculate wellness score from responses"""
    total_score = 0
    question_count = 0
    
    for key, value in responses.items():
        if isinstance(value, (int, float)):
            total_score += value
            question_count += 1
        elif isinstance(value, str):
            # Convert text responses to numeric scores
            if value.lower() in ['excellent', 'very good', 'great']:
                total_score += 5
            elif value.lower() in ['good', 'okay', 'fine']:
                total_score += 4
            elif value.lower() in ['neutral', 'average']:
                total_score += 3
            elif value.lower() in ['poor', 'bad', 'not good']:
                total_score += 2
            elif value.lower() in ['very poor', 'terrible', 'awful']:
                total_score += 1
            else:
                total_score += 3  # Default neutral
            question_count += 1
    
    if question_count == 0:
        return 3.0
    
    return round(total_score / question_count, 2)


def generate_recommendations(score: float, responses: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized recommendations"""
    
    if score >= 4.0:
        risk_level = "low"
        message = "Great job! You're showing positive mental wellness patterns."
        recommendations = [
            "Continue your current wellness practices",
            "Consider sharing your strategies with others",
            "Maintain regular self-check-ins"
        ]
    elif score >= 3.0:
        risk_level = "moderate"
        message = "You're doing okay, but there's room for improvement in your wellness journey."
        recommendations = [
            "Try incorporating daily mindfulness exercises",
            "Establish a regular sleep schedule",
            "Consider talking to a counselor or therapist",
            "Engage in regular physical activity"
        ]
    else:
        risk_level = "high"
        message = "It looks like you might benefit from additional support for your mental wellness."
        recommendations = [
            "Consider reaching out to a mental health professional",
            "Contact a crisis helpline if you're in immediate distress",
            "Talk to trusted friends or family members",
            "Practice grounding techniques when feeling overwhelmed",
            "Prioritize basic self-care: sleep, nutrition, and hydration"
        ]
    
    return {
        "risk_level": risk_level,
        "message": message,
        "recommendations": recommendations,
        "score": score,
        "next_steps": [
            "Continue regular mood tracking",
            "Schedule follow-up assessment in 2 weeks",
            "Explore our resources section for additional support"
        ]
    }