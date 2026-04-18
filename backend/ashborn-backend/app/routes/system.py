

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models.user import User, UserIdentity
from app.schemas.evaluation_schema import (
    GenerateEvaluationRequest, 
    GenerateEvaluationResponse, 
    EvaluationQuestionDetail,
    SubmitEvaluationRequest,
    SubmitEvaluationResponse
)
from app.models.evaluation import EvaluationQuestion, EvaluationAnswer
from app.models.dashboard import DailyProtocol
from app.schemas.protocol_schema import (
    GenerateProtocolRequest, 
    GenerateProtocolResponse, 
    ProtocolTaskDetail,
    CompleteTaskRequest,
    CompleteTaskResponse
)
from sqlalchemy import update
import json
from app.services.ai_service import (
    generate_system_evaluation_questions,
    evaluate_system_submitted_answers,
    generate_daily_protocol,
    generate_daily_feedback
)
from app.models.progress import DailyStat, EvolutionLog
from app.schemas.progress_schema import (
    DailyEvaluationRequest, 
    DailyEvaluationResponse, 
    ProgressResponse, 
    DailyStatDetail, 
    EvolutionLogDetail
)

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/dashboard/{user_id}")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    """
    Dashboard API

    1. Validate user
    2. Ensure onboarding completed
    3. Return placeholder dashboard data (AI generation / DB logic can be added later)
    """

    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    identity = db.execute(
        select(UserIdentity).where(UserIdentity.user_id == user_id)
    ).scalar_one_or_none()

    if not identity:
        raise HTTPException(status_code=404, detail="User identity not found")

    if not identity.onboarding_completed:
        raise HTTPException(
            status_code=400,
            detail="User has not completed onboarding"
        )

    tasks_query = db.execute(select(DailyProtocol).where(DailyProtocol.user_id == user_id)).scalars().all()
    tasks_list = [{"id": t.id, "label": t.label, "xp": f"+{t.xp}", "done": t.done} for t in tasks_query]

    # In-App Notifications / System Warnings
    notifications = []
    missed_count = len([t for t in tasks_query if not t.done])
    if missed_count > 0:
        notifications.append(f"WARNING: {missed_count} incomplete directives today. Execute immediately.")
    
    if identity.streak == 0:
        notifications.append("CRITICAL: Momentum broken. Routine slipping.")
    elif identity.streak >= 3:
        notifications.append(f"MOMENTUM: {identity.streak} Day Streak. Maintain velocity.")
        
    notifications.append("SYSTEM INITIALIZED. PLAYER DATA SYNCED.")
    logs_array = [{"time": datetime.utcnow().strftime("%H:%M:%S"), "message": msg} for msg in notifications]

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "goal": identity.goal,
            "rank": identity.rank,
            "discipline_score": identity.discipline_score,
            "alignment_score": identity.alignment_score,
            "streak": identity.streak,
            "xp": getattr(identity, 'xp', 0)
        },
        "tasks": tasks_list,
        "alignment_percent": identity.alignment_score,
        "objective": {
            "title": identity.goal,
            "progress": 0,
            "target": 100
        },
        "system_logs": logs_array
    }


@router.post("/generate-evaluation", response_model=GenerateEvaluationResponse)
def generate_evaluation(data: GenerateEvaluationRequest, db: Session = Depends(get_db)):
    """
    Generate 8-10 evaluation questions strictly using OpenAI API,
    store in evaluation_questions DB, and return.
    """
    
    # Optionally verify user exists
    user = db.execute(select(User).where(User.id == data.user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Generate questions using AI
    questions_data = generate_system_evaluation_questions(data.goal)
    if not questions_data:
        raise HTTPException(status_code=500, detail="Failed to generate evaluation questions")
        
    db_questions = []
    
    for q_data in questions_data:
        # options could be a list, or none
        options_val = q_data.get("options")
        options_json = json.dumps(options_val) if options_val else None
        
        db_q = EvaluationQuestion(
            user_id=data.user_id,
            question=q_data.get("question", ""),
            question_type=q_data.get("type", "text"),
            options=options_json
        )
        db.add(db_q)
        db_questions.append(db_q)
        
    db.commit()
    
    # Read assigned IDs
    response_questions = []
    for db_q in db_questions:
        db.refresh(db_q)
        response_questions.append(
            EvaluationQuestionDetail(
                id=db_q.id,
                type=db_q.question_type,
                question=db_q.question,
                options=json.loads(db_q.options) if db_q.options else None
            )
        )
        
    return GenerateEvaluationResponse(
        message="Evaluation generated successfully",
        questions=response_questions
    )


@router.post("/submit-evaluation", response_model=SubmitEvaluationResponse)
def submit_evaluation(data: SubmitEvaluationRequest, db: Session = Depends(get_db)):
    """
    Submit evaluation answers, save them locally in DB, have OpenAI compute 
    discipline/alignment/rank + system message, and fully update UserIdentity.
    """
    
    # Verify user identity exists
    identity = db.execute(
        select(UserIdentity).where(UserIdentity.user_id == data.user_id)
    ).scalar_one_or_none()
    
    if not identity:
        raise HTTPException(status_code=404, detail="User identity not found for evaluation.")
        
    # Save answers to EvaluationAnswer table
    for ans in data.answers:
        db_answer = EvaluationAnswer(
            user_id=data.user_id,
            question_id=ans.question_id,
            answer_text=ans.answer
        )
        db.add(db_answer)
        
    db.commit()
    
    # Process through OpenAI Judge
    answers_list = [{"question": a.question, "answer": a.answer} for a in data.answers]
    result = evaluate_system_submitted_answers(goal=identity.goal, answers=answers_list)
    
    discipline_score = result.get("discipline_score", 0)
    alignment_score = result.get("alignment_score", 0)
    rank = result.get("rank", "E")
    system_message = result.get("system_message", "Analyzed and noted.")
    
    # Update user identity with processed metrics
    db.execute(
        update(UserIdentity)
        .where(UserIdentity.user_id == data.user_id)
        .values(
            discipline_score=discipline_score,
            alignment_score=alignment_score,
            rank=rank,
            onboarding_completed=True
        )
    )
    db.commit()
    
    return SubmitEvaluationResponse(
        discipline_score=discipline_score,
        alignment_score=alignment_score,
        system_message=system_message,
        rank=rank
    )


@router.post("/generate-protocol", response_model=GenerateProtocolResponse)
def generate_protocol(data: GenerateProtocolRequest, db: Session = Depends(get_db)):
    identity = db.execute(select(UserIdentity).where(UserIdentity.user_id == data.user_id)).scalar_one_or_none()
    if not identity:
        raise HTTPException(status_code=404, detail="User not found")
        
    stats = db.execute(select(DailyStat).where(DailyStat.user_id == data.user_id).order_by(DailyStat.created_at.desc()).limit(14)).scalars().all()
    consistency = 100.0
    if len(stats) > 0:
        consistency = (sum(s.tasks_completed for s in stats) / (len(stats) * 5.0)) * 100.0

    protocol_data = generate_daily_protocol(
        identity.goal, 
        identity.discipline_score, 
        identity.alignment_score,
        consistency=consistency,
        streak=identity.streak
    )
    focus_area = protocol_data.get("focus_area", "General Alignment")
    raw_tasks = protocol_data.get("tasks", [])
    
    db_tasks = []
    for t in raw_tasks:
        dt = DailyProtocol(
            user_id=data.user_id,
            focus_area=focus_area,
            label=t.get("label", "System Task"),
            xp=t.get("xp", 10),
            done=False
        )
        db.add(dt)
        db_tasks.append(dt)
        
    db.commit()
    for dt in db_tasks:
        db.refresh(dt)
        
    return GenerateProtocolResponse(
        focus_area=focus_area,
        tasks=[
            ProtocolTaskDetail(
                id=dt.id,
                focus_area=dt.focus_area,
                label=dt.label,
                xp=dt.xp,
                done=dt.done
            ) for dt in db_tasks
        ]
    )

@router.post("/complete-task", response_model=CompleteTaskResponse)
def complete_task(data: CompleteTaskRequest, db: Session = Depends(get_db)):
    task = db.execute(select(DailyProtocol).where(DailyProtocol.id == data.task_id, DailyProtocol.user_id == data.user_id)).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.done:
        return CompleteTaskResponse(message="Already complete", xp_gained=0, new_streak=0)
        
    task.done = True
    
    identity = db.execute(select(UserIdentity).where(UserIdentity.user_id == data.user_id)).scalar_one_or_none()
    new_streak = 0
    if identity:
        identity.streak += 1
        if not hasattr(identity, 'xp') or identity.xp is None:
            identity.xp = 0
        identity.xp += task.xp
        new_streak = identity.streak
        
    db.commit()
    
    return CompleteTaskResponse(
        message="Task marked complete",
        xp_gained=task.xp,
        new_streak=new_streak
    )

def calculate_rank(alignment: int) -> str:
    if alignment < 30: return "E"
    elif alignment < 50: return "D"
    elif alignment < 70: return "C"
    elif alignment < 85: return "B"
    elif alignment < 95: return "A"
    return "S"


@router.post("/daily-evaluation", response_model=DailyEvaluationResponse)
def run_daily_evaluation(data: DailyEvaluationRequest, db: Session = Depends(get_db)):
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    tasks = db.execute(select(DailyProtocol).where(DailyProtocol.user_id == data.user_id)).scalars().all()
    identity = db.execute(select(UserIdentity).where(UserIdentity.user_id == data.user_id)).scalar_one_or_none()
    
    if not identity:
        raise HTTPException(status_code=404, detail="Identity missing")
        
    completed = [t for t in tasks if t.done]
    missed = [t for t in tasks if not t.done]
    total_xp = sum(t.xp for t in completed)
    
    completion_rate = len(completed) / max(len(tasks), 1)
    
    if completion_rate >= 0.8:
        identity.discipline_score = min(100, identity.discipline_score + 2)
        identity.alignment_score = min(100, identity.alignment_score + 1)
    elif completion_rate < 0.5:
        identity.discipline_score = max(0, identity.discipline_score - 2)
        identity.alignment_score = max(0, identity.alignment_score - 2)
        identity.streak = 0
        
    identity.rank = calculate_rank(identity.alignment_score)
    
    feedback_data = generate_daily_feedback(
        len(completed), len(missed), 
        identity.discipline_score, identity.alignment_score, identity.rank
    )
    
    stat = db.execute(select(DailyStat).where(DailyStat.user_id == data.user_id, DailyStat.date == today_str)).scalar_one_or_none()
    if not stat:
        stat = DailyStat(
            user_id=data.user_id,
            date=today_str,
            xp_gained=total_xp,
            tasks_completed=len(completed),
            discipline=identity.discipline_score
        )
        db.add(stat)
    else:
        stat.xp_gained += total_xp
        stat.tasks_completed = len(completed)
        stat.discipline = identity.discipline_score
        
    log = EvolutionLog(
        user_id=data.user_id,
        rank_snapshot=identity.rank,
        system_message=feedback_data.get("system_message", ""),
        feedback=feedback_data.get("feedback", ""),
        warnings=feedback_data.get("warnings", ""),
        improvements=feedback_data.get("improvement_suggestions", "")
    )
    db.add(log)
    
    for t in tasks:
        db.delete(t)
        
    db.commit()
    
    return DailyEvaluationResponse(
        message="Daily analysis complete.",
        new_rank=identity.rank,
        system_feedback=feedback_data.get("system_message", "")
    )

@router.get("/progress/{user_id}", response_model=ProgressResponse)
def get_progress(user_id: int, db: Session = Depends(get_db)):
    identity = db.execute(select(UserIdentity).where(UserIdentity.user_id == user_id)).scalar_one_or_none()
    stats = db.execute(select(DailyStat).where(DailyStat.user_id == user_id).order_by(DailyStat.created_at.desc()).limit(14)).scalars().all()
    evolution = db.execute(select(EvolutionLog).where(EvolutionLog.user_id == user_id).order_by(EvolutionLog.created_at.desc()).limit(10)).scalars().all()
    
    consistency = 0.0
    if len(stats) > 0:
        total = sum(s.tasks_completed for s in stats)
        consistency = round(min(100.0, (total / (len(stats) * 5.0)) * 100))
        
    return ProgressResponse(
        streak=identity.streak if identity else 0,
        consistency=consistency,
        graph_data=[
            DailyStatDetail(
                date=s.date,
                xp_gained=s.xp_gained,
                discipline=s.discipline,
                tasks_completed=s.tasks_completed
            ) for s in reversed(stats)
        ],
        evolution=[
            EvolutionLogDetail(
                rank_snapshot=e.rank_snapshot,
                system_message=e.system_message or "",
                feedback=e.feedback or "",
                warnings=e.warnings or "",
                improvements=e.improvements or "",
                created_at=e.created_at.strftime("%Y-%m-%d %H:%M")
            ) for e in evolution
        ]
    )