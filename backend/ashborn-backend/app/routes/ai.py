from typing import Union, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.user import UserIdentity
from app.services.ai_service import generate_dynamic_questions
from app.core.static_questions import STATIC_QUESTIONS
from pydantic import BaseModel
from sqlalchemy import update
from app.services.ai_service import evaluate_user_answers


router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/evaluation-questions")
def get_evaluation_questions(user_id: int, db: Session = Depends(get_db)):
    """
    1. Get user goal from DB
    2. Generate 4 dynamic AI questions based on goal
    3. Merge with 6 static psychological questions
    """

    # get user identity
    identity = db.execute(
        select(UserIdentity).where(UserIdentity.user_id == user_id)
    ).scalar_one_or_none()

    if not identity:
        raise HTTPException(status_code=404, detail="User not found")

    goal = identity.goal

    # generate dynamic questions from AI
    dynamic_questions = generate_dynamic_questions(goal)

    return {
        "goal": goal,
        "static_questions": STATIC_QUESTIONS,
        "dynamic_questions": dynamic_questions,
        "total_questions": len(STATIC_QUESTIONS) + len(dynamic_questions)
    }


class AnswerItem(BaseModel):
    question_id: int
    question: str
    answer: Union[str, int, float]


class EvaluationSubmitRequest(BaseModel):
    user_id: int
    answers: List[AnswerItem]


@router.post("/submit-evaluation")
def submit_evaluation(data: EvaluationSubmitRequest, db: Session = Depends(get_db)):
    """
    Evaluate user using OpenAI judge
    - receives all answers
    - sends to AI
    - gets discipline score, alignment score, rank
    - updates DB
    """

    identity = db.execute(
        select(UserIdentity).where(UserIdentity.user_id == data.user_id)
    ).scalar_one_or_none()

    if not identity:
        raise HTTPException(status_code=404, detail="User not found")

    # Call AI judge
    result = evaluate_user_answers(
        goal=identity.goal,
        answers=[a.dict() for a in data.answers]
    )

    discipline_score = result.get("discipline_score", 0)
    alignment_score = result.get("alignment_score", 0)
    rank = result.get("rank", "E")
    verdict = result.get("verdict", "")

    # Update DB
    db.execute(
        update(UserIdentity)
        .where(UserIdentity.user_id == data.user_id)
        .values(
            discipline_score=discipline_score,
            alignment_score=alignment_score,
            rank=rank,
            onboarding_completed=True,
        )
    )

    db.commit()

    return {
        "message": "Evaluation complete",
        "rank": rank,
        "discipline_score": discipline_score,
        "alignment_score": alignment_score,
        "verdict": verdict,
    }