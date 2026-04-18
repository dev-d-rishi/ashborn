from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.user import Base

class DailyStat(Base):
    __tablename__ = "daily_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    date: Mapped[str] = mapped_column(String(50)) # Formatted YYYY-MM-DD
    xp_gained: Mapped[int] = mapped_column(Integer, default=0)
    tasks_completed: Mapped[int] = mapped_column(Integer, default=0)
    discipline: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class EvolutionLog(Base):
    __tablename__ = "evolution_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    rank_snapshot: Mapped[str] = mapped_column(String(50))
    system_message: Mapped[str] = mapped_column(Text)
    feedback: Mapped[str] = mapped_column(Text)
    warnings: Mapped[str] = mapped_column(Text)
    improvements: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
