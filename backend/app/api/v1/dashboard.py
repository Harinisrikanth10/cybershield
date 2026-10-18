from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.analysis import AnalysisRecord
from app.models.alert import Alert
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    RecentActivityItem,
    RiskDistribution,
    CategoryDistribution,
    SecurityTip,
)

router = APIRouter(prefix="/dashboard", tags=["Security Dashboard"])

CURATED_TIPS = [
    SecurityTip(
        id="tip-1",
        title="Verify Wire Transfers Out-of-Band",
        category="Social Engineering",
        tip="Never approve significant wire payments based purely on email or SMS. Call the verified vendor or executive on a known phone number.",
        severity="high",
    ),
    SecurityTip(
        id="tip-2",
        title="Check the Root Domain, Not Just HTTPS",
        category="Web Safety",
        tip="Over 80% of phishing sites use valid SSL/HTTPS certificates to display the padlock icon. The padlock only encrypts transport, it does not guarantee legitimacy.",
        severity="medium",
    ),
    SecurityTip(
        id="tip-3",
        title="Beware of Emergency Password Resets",
        category="Account Security",
        tip="Legitimate security operations will not pressure you into instant resets via urgent external links. Navigate directly to your service portal.",
        severity="high",
    ),
    SecurityTip(
        id="tip-4",
        title="Deepfake Voice Duplication Defense",
        category="AI Safety",
        tip="Establish a secret family or company passphrase for emergency financial authorizations to counter generative voice cloning.",
        severity="medium",
    ),
]

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analyses = db.query(AnalysisRecord).filter(AnalysisRecord.user_id == current_user.id).all()
    total_analyses = len(analyses)

    high_risk_count = sum(1 for a in analyses if a.risk_category == "High")
    critical_risk_count = sum(1 for a in analyses if a.risk_category == "Critical")
    medium_risk_count = sum(1 for a in analyses if a.risk_category == "Moderate")
    low_risk_count = sum(1 for a in analyses if a.risk_category == "Low")

    unread_alerts = db.query(Alert).filter(Alert.user_id == current_user.id, Alert.is_read == False).count()

    # Category distribution
    cat_dist = {
        "url": sum(1 for a in analyses if a.submission_type == "url"),
        "text": sum(1 for a in analyses if a.submission_type == "text"),
        "image": sum(1 for a in analyses if a.submission_type == "image"),
        "audio": sum(1 for a in analyses if a.submission_type == "audio"),
        "video": sum(1 for a in analyses if a.submission_type == "video"),
    }

    recent = sorted(analyses, key=lambda a: a.created_at, reverse=True)[:6]
    recent_activity = [
        RecentActivityItem(
            id=a.id,
            submission_type=a.submission_type,
            target_summary=a.target_summary,
            risk_score=a.risk_score,
            risk_category=a.risk_category,
            status=a.status,
            created_at=a.created_at,
        )
        for a in recent
    ]

    return DashboardSummaryResponse(
        total_analyses=total_analyses,
        high_risk_items=high_risk_count,
        medium_risk_items=medium_risk_count,
        low_risk_items=low_risk_count,
        critical_risk_items=critical_risk_count,
        unread_alerts_count=unread_alerts,
        risk_distribution=RiskDistribution(
            low=low_risk_count,
            medium=medium_risk_count,
            high=high_risk_count,
            critical=critical_risk_count,
        ),
        category_distribution=CategoryDistribution(**cat_dist),
        recent_activity=recent_activity,
        security_tips=CURATED_TIPS,
    )
