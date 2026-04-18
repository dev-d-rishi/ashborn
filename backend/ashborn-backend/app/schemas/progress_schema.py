from pydantic import BaseModel
from typing import List, Optional

class DailyStatDetail(BaseModel):
    date: str
    xp_gained: int
    discipline: int
    tasks_completed: int

class EvolutionLogDetail(BaseModel):
    rank_snapshot: str
    system_message: str
    feedback: Optional[str] = None
    warnings: Optional[str] = None
    improvements: Optional[str] = None
    created_at: str

class ProgressResponse(BaseModel):
    streak: int
    consistency: float
    graph_data: List[DailyStatDetail]
    evolution: List[EvolutionLogDetail]
    
class DailyEvaluationRequest(BaseModel):
    user_id: int

class DailyEvaluationResponse(BaseModel):
    message: str
    new_rank: str
    system_feedback: str
