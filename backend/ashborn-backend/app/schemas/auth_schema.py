from pydantic import BaseModel, EmailStr, Field, field_validator


class AuthInitRequest(BaseModel):
    email: EmailStr
    goal: str = Field(..., min_length=10)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class AuthInitResponseCreated(BaseModel):
    status: str
    user_id: int
    rank: str
    discipline_score: int
    alignment_score: int
    message: str


class AuthInitResponseExists(BaseModel):
    status: str
    user_id: int
    rank: str
    goal: str
