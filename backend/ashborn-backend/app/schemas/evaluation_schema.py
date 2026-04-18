from pydantic import BaseModel
from typing import List, Optional

class GenerateEvaluationRequest(BaseModel):
    user_id: int
    goal: str

class EvaluationQuestionDetail(BaseModel):
    id: Optional[int] = None
    type: str
    question: str
    options: Optional[List[str]] = None

class GenerateEvaluationResponse(BaseModel):
    message: str
    questions: List[EvaluationQuestionDetail]

class SubmitEvaluationAnswerDetail(BaseModel):
    question_id: int
    question: str
    answer: str

class SubmitEvaluationRequest(BaseModel):
    user_id: int
    answers: List[SubmitEvaluationAnswerDetail]

class SubmitEvaluationResponse(BaseModel):
    discipline_score: int
    alignment_score: int
    system_message: str
    rank: str
