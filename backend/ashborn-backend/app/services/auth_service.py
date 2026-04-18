import logging
from typing import Dict, Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User, UserIdentity

logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    def initialize_user(email: str, goal: str, db: Session) -> Dict[str, Any]:
        """
        Initialize a user and their identity if they do not exist.
        If they exist, return their existing data.
        """
        normalized_email = email.strip().lower()

        try:
            # Check if user exists
            stmt = select(User).where(User.email == normalized_email)
            existing_user = db.scalars(stmt).first()

            if existing_user:
                identity = existing_user.identity
                return {
                    "status": "exists",
                    "user_id": existing_user.id,
                    "rank": identity.rank if identity else "E",
                    "goal": identity.goal if identity else goal
                }

            # Create new user
            new_user = User(email=normalized_email)
            db.add(new_user)
            db.flush()  # Flush to generate the user ID

            # Create associated user identity
            new_identity = UserIdentity(
                user_id=new_user.id,
                goal=goal,
                rank="E",
                discipline_score=0,
                alignment_score=0
            )
            db.add(new_identity)

            db.commit()

            return {
                "status": "created",
                "user_id": new_user.id,
                "rank": new_identity.rank,
                "discipline_score": new_identity.discipline_score,
                "alignment_score": new_identity.alignment_score,
                "message": "User initialized successfully"
            }

        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error during user initialization for email {normalized_email}: {e}")
            raise ValueError("Database integrity error occurred. The user might already exist.") from e
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error during user initialization: {e}")
            raise
