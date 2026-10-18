from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertOut, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Security Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    unread_only: bool = False,
    severity: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Alert).filter(Alert.user_id == current_user.id)
    if unread_only:
        query = query.filter(Alert.is_read == False)
    if severity:
        query = query.filter(Alert.severity == severity.lower())
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    return [AlertOut.model_validate(a) for a in alerts]

@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: str,
    update_data: AlertUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    
    alert.is_read = update_data.is_read
    db.commit()
    db.refresh(alert)
    return AlertOut.model_validate(alert)

@router.post("/mark-all-read")
def mark_all_alerts_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Alert).filter(Alert.user_id == current_user.id, Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All security alerts marked as read."}

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    
    db.delete(alert)
    db.commit()
    return {"message": "Alert dismissed and removed.", "id": alert_id}
