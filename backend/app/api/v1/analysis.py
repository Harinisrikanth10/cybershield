from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.analysis import AnalysisRecord
from app.models.alert import Alert
from app.schemas.analysis import (
    UrlAnalysisRequest,
    TextAnalysisRequest,
    AnalysisResponse,
    ReportDetailResponse,
)
from app.services.url_analyzer import analyze_url
from app.services.text_analyzer import analyze_text
from app.services.image_analyzer import analyze_image_bytes
from app.services.audio_analyzer import analyze_audio_bytes
from app.services.video_analyzer import analyze_video_bytes

router = APIRouter(prefix="/analysis", tags=["Threat Analysis Center"])

def _create_record_and_alert(result: dict, user_id: str, sub_type: str, preview: str, db: Session) -> AnalysisRecord:
    record = AnalysisRecord(
        user_id=user_id,
        submission_type=sub_type,
        target_summary=result.get("target_summary", "Analyzed Target"),
        raw_input_preview=preview[:500] if preview else None,
        risk_score=result["risk_score"],
        risk_category=result["risk_category"],
        confidence_score=result["confidence_score"],
        status=result["status"],
        findings_json=result["findings"],
        evidence_json=result["evidence"],
        limitations_json=result["limitations"],
        recommendations_json=result["recommendations"],
        model_info_json=result["model_info"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Automatically generate an alert if risk is High or Critical (score >= 50)
    if record.risk_score >= 50:
        alert_title = f"{record.risk_category} Risk Threat Detected: {record.target_summary[:40]}"
        alert_msg = f"CyberShield detected {len(record.findings_json)} indicators with risk score {record.risk_score}/100."
        new_alert = Alert(
            user_id=user_id,
            analysis_id=record.id,
            title=alert_title,
            message=alert_msg,
            severity=record.risk_category.lower(),
            is_read=False,
        )
        db.add(new_alert)
        db.commit()

    return record

@router.post("/url", response_model=AnalysisResponse)
def analyze_url_endpoint(
    req: UrlAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = analyze_url(req.url)
    record = _create_record_and_alert(result, current_user.id, "url", req.url, db)
    return AnalysisResponse(
        id=record.id,
        submission_type=record.submission_type,
        target_summary=record.target_summary,
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

@router.post("/text", response_model=AnalysisResponse)
def analyze_text_endpoint(
    req: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = analyze_text(req.text, context_type=req.context_type or "message")
    record = _create_record_and_alert(result, current_user.id, "text", req.text, db)
    return AnalysisResponse(
        id=record.id,
        submission_type=record.submission_type,
        target_summary=record.target_summary,
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

@router.post("/image", response_model=AnalysisResponse)
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    filename = file.filename or "uploaded_image"
    content_type = file.content_type or "image/jpeg"
    result = analyze_image_bytes(content, filename=filename, mime_type=content_type)
    record = _create_record_and_alert(result, current_user.id, "image", filename, db)
    return AnalysisResponse(
        id=record.id,
        submission_type=record.submission_type,
        target_summary=record.target_summary,
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

@router.post("/audio", response_model=AnalysisResponse)
async def analyze_audio_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    filename = file.filename or "uploaded_audio"
    content_type = file.content_type or "audio/wav"
    result = analyze_audio_bytes(content, filename=filename, mime_type=content_type)
    record = _create_record_and_alert(result, current_user.id, "audio", filename, db)
    return AnalysisResponse(
        id=record.id,
        submission_type=record.submission_type,
        target_summary=record.target_summary,
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

@router.post("/video", response_model=AnalysisResponse)
async def analyze_video_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    filename = file.filename or "uploaded_video"
    content_type = file.content_type or "video/mp4"
    result = analyze_video_bytes(content, filename=filename, mime_type=content_type)
    record = _create_record_and_alert(result, current_user.id, "video", filename, db)
    return AnalysisResponse(
        id=record.id,
        submission_type=record.submission_type,
        target_summary=record.target_summary,
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

@router.get("", response_model=List[AnalysisResponse])
def get_analyses(
    search: Optional[str] = None,
    type: Optional[str] = None,
    risk: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AnalysisRecord).filter(AnalysisRecord.user_id == current_user.id)
    if search:
        query = query.filter(AnalysisRecord.target_summary.ilike(f"%{search}%"))
    if type:
        query = query.filter(AnalysisRecord.submission_type == type.lower())
    if risk:
        query = query.filter(AnalysisRecord.risk_category.ilike(risk))

    records = query.order_by(AnalysisRecord.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        AnalysisResponse(
            id=r.id,
            submission_type=r.submission_type,
            target_summary=r.target_summary,
            risk_score=r.risk_score,
            risk_category=r.risk_category,
            confidence_score=r.confidence_score,
            status=r.status,
            findings=r.findings_json,
            evidence=r.evidence_json,
            limitations=r.limitations_json,
            recommendations=r.recommendations_json,
            model_info=r.model_info_json,
            created_at=r.created_at,
        )
        for r in records
    ]

@router.get("/{analysis_id}", response_model=ReportDetailResponse)
def get_analysis_by_id(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == analysis_id,
        AnalysisRecord.user_id == current_user.id
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

@router.delete("/{analysis_id}", status_code=status.HTTP_200_OK)
def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(AnalysisRecord).filter(
        AnalysisRecord.id == analysis_id,
        AnalysisRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat record not found.")
    
    db.delete(record)
    db.commit()
    return {"message": "Threat analysis record deleted successfully.", "id": analysis_id}
