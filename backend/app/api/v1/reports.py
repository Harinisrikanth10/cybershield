from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.analysis import AnalysisRecord
from app.schemas.analysis import ReportDetailResponse

router = APIRouter(prefix="/reports", tags=["Threat Reports"])

@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == report_id,
        AnalysisRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat report not found.")

    return ReportDetailResponse(
        id=record.id,
        user_id=record.user_id,
        submission_type=record.submission_type,
        target_summary=record.target_summary,
        raw_input_preview=record.raw_input_preview,
        risk_score=record.risk_score,
        risk_category=record.risk_category,
        confidence_score=record.confidence_score,
        status=record.status,
        findings=record.findings_json,
        evidence=record.evidence_json,
        limitations=record.limitations_json,
        recommendations=record.recommendations_json,
        model_info=record.model_info_json,
        created_at=record.created_at,
    )

@router.get("/{report_id}/export")
def export_report_data(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == report_id,
        AnalysisRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat report not found.")

    return {
        "export_format": "CyberShield AI Threat Report v1.0",
        "generated_at": record.created_at.isoformat(),
        "report_id": record.id,
        "analyst_account": current_user.email,
        "submission_type": record.submission_type,
        "target_summary": record.target_summary,
        "risk_evaluation": {
            "score": record.risk_score,
            "category": record.risk_category,
            "confidence": record.confidence_score,
            "status": record.status,
        },
        "findings": record.findings_json,
        "observed_evidence": record.evidence_json,
        "recommended_actions": record.recommendations_json,
        "model_limitations": record.limitations_json,
        "provenance": record.model_info_json,
    }

@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == report_id,
        AnalysisRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat report not found.")

    db.delete(record)
    db.commit()
    return {"message": "Report deleted successfully.", "id": report_id}
