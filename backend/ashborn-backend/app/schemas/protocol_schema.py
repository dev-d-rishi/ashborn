from pydantic import BaseModel
from typing import List

class GenerateProtocolRequest(BaseModel):
    user_id: int

class ProtocolTaskDetail(BaseModel):
    id: int
    focus_area: str
    label: str
    xp: int
    done: bool

class GenerateProtocolResponse(BaseModel):
    focus_area: str
    tasks: List[ProtocolTaskDetail]

class CompleteTaskRequest(BaseModel):
    user_id: int
    task_id: int

class CompleteTaskResponse(BaseModel):
    message: str
    xp_gained: int
    new_streak: int
