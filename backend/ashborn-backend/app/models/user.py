from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, Boolean, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """
    Base class for declarative models.
    In a complete application, this would typically be imported from a central 
    database configuration module (e.g., `from app.database import Base`).
    """
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # One-to-One relationship with UserIdentity
    identity: Mapped[Optional["UserIdentity"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


class UserIdentity(Base):
    __tablename__ = "user_identity"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    goal: Mapped[str] = mapped_column(Text, nullable=False)
    rank: Mapped[str] = mapped_column(String(50), default="E", server_default="E")
    discipline_score: Mapped[int] = mapped_column(default=0, server_default="0")
    alignment_score: Mapped[int] = mapped_column(default=0, server_default="0")
    streak: Mapped[int] = mapped_column(default=0, server_default="0")
    xp: Mapped[int] = mapped_column(default=0, server_default="0")
    onboarding_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationship back to User
    user: Mapped["User"] = relationship(back_populates="identity")

    def __repr__(self) -> str:
        return f"<UserIdentity(id={self.id}, user_id={self.user_id}, rank={self.rank})>"
