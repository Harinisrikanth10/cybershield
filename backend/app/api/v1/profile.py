from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.analysis import AnalysisRecord
from app.models.alert import Alert
from app.models.learn import UserLearnProgress
from app.schemas.auth import UserOut
from app.schemas.profile import ProfileUpdate, ProfileExportData

router = APIRouter(prefix="/profile", tags=["User Profile & Settings"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.patch("", response_model=UserOut)
def update_profile(
    update_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name.strip()
    if update_in.theme is not None and update_in.theme in ("dark", "light"):
        current_user.theme = update_in.theme
    if update_in.notify_email is not None:
        current_user.notify_email = update_in.notify_email
    if update_in.notify_high_risk is not None:
        current_user.notify_high_risk = update_in.notify_high_risk

    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)

@router.post("/export", response_model=ProfileExportData)
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analyses = db.query(AnalysisRecord).filter(AnalysisRecord.user_id == current_user.id).all()
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    progress = db.query(UserLearnProgress).filter(UserLearnProgress.user_id == current_user.id).all()

    return ProfileExportData(
        export_timestamp=datetime.now(timezone.utc),
        user_info={
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat(),
        },
        total_analyses=len(analyses),
        analyses=[
            {
                "id": a.id,
                "submission_type": a.submission_type,
                "target_summary": a.target_summary,
                "risk_score": a.risk_score,
                "risk_category": a.risk_category,
                "status": a.status,
                "created_at": a.created_at.isoformat(),
            }
            for a in analyses
        ],
        alerts=[
            {
                "id": al.id,
                "title": al.title,
                "severity": al.severity,
                "is_read": al.is_read,
                "created_at": al.created_at.isoformat(),
            }
            for al in alerts
        ],
        learning_progress=[
            {
                "course_id": p.course_id,
                "completed": p.completed,
                "quiz_score": p.quiz_score,
            }
            for p in progress
        ],
    )

@router.delete("", status_code=status.HTTP_200_OK)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Cascading delete removes all analyses, alerts, progress, chat messages
    db.delete(current_user)
    db.commit()
    return {"message": "User account and all associated threat records permanently erased."}
