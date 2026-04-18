from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db  # Assuming db dependency is here
from app.schemas.auth_schema import (
    AuthInitRequest,
    AuthInitResponseCreated,
    AuthInitResponseExists,
)
from app.services.auth_service import AuthService
from sqlalchemy import select
from app.models.user import User, UserIdentity

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/init",
    response_model=Union[AuthInitResponseCreated, AuthInitResponseExists],
    status_code=status.HTTP_200_OK,
    responses={
        201: {"model": AuthInitResponseCreated, "description": "User created successfully"},
        200: {"model": AuthInitResponseExists, "description": "User already exists"}
    }
)
def init_user(
    request: AuthInitRequest,
    db: Session = Depends(get_db)
):
    """
    Initialize a new user or return existing user data.
    """
    try:
        result = AuthService.initialize_user(
            email=request.email,
            goal=request.goal,
            db=db
        )
        
        if result.get("status") == "created":
            # Return 201 Created for new users
            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content=jsonable_encoder(AuthInitResponseCreated(**result))
            )
            
        # Return 200 OK for existing users
        return AuthInitResponseExists(**result)

    except ValueError as e:
        # Handles user-facing service integrity errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Handles unexpected logical or connection errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during user initialization"
        )


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """
    Fetch all users list with basic info
    """
    users = db.execute(select(User)).scalars().all()

    response = []
    for u in users:
        response.append({
            "id": u.id,
            "email": u.email,
            "created_at": u.created_at
        })

    return {
        "total": len(response),
        "users": response
    }


@router.get("/users/{user_id}")
def get_user_detail(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch single user detail with goal + rank + scores
    """
    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    identity = db.execute(
        select(UserIdentity).where(UserIdentity.user_id == user_id)
    ).scalar_one_or_none()

    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at,
        "goal": identity.goal if identity else None,
        "rank": identity.rank if identity else None,
        "discipline_score": identity.discipline_score if identity else None,
        "alignment_score": identity.alignment_score if identity else None,
        "onboarding_completed": identity.onboarding_completed if identity else False,
    }
