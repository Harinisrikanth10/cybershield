from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.assistant import ChatSession, ChatMessage
from app.models.analysis import AnalysisRecord
from app.schemas.assistant import ChatMessageCreate, ChatMessageOut, ChatSessionOut
from app.services.assistant_service import generate_assistant_response

router = APIRouter(prefix="/assistant", tags=["AI Security Assistant"])

@router.post("/chat", response_model=ChatMessageOut)
async def chat_with_assistant(
    req: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find or create active session for user
    session = None
    if req.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == req.session_id,
            ChatSession.user_id == current_user.id
        ).first()

    if not session:
        session = ChatSession(
            user_id=current_user.id,
            title=req.content[:35] + ("..." if len(req.content) > 35 else ""),
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.content,
        attached_report_id=req.attached_report_id,
    )
    db.add(user_msg)
    db.commit()

    # If an attached report is referenced, load its details
    attached_report_data = None
    if req.attached_report_id:
        report_record = db.query(AnalysisRecord).filter(
            AnalysisRecord.id == req.attached_report_id,
            AnalysisRecord.user_id == current_user.id
        ).first()
        if report_record:
            attached_report_data = {
                "id": report_record.id,
                "submission_type": report_record.submission_type,
                "target_summary": report_record.target_summary,
                "risk_score": report_record.risk_score,
                "risk_category": report_record.risk_category,
                "findings": report_record.findings_json,
                "evidence": report_record.evidence_json,
                "recommendations": report_record.recommendations_json,
            }

    # Fetch recent session history for conversational context
    past_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.desc()).limit(6).all()
    history_list = [{"role": m.role, "content": m.content} for m in reversed(past_msgs)]

    # Generate assistant answer
    reply_text = await generate_assistant_response(
        user_prompt=req.content,
        attached_report=attached_report_data,
        chat_history=history_list,
    )

    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=reply_text,
        attached_report_id=req.attached_report_id,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageOut.model_validate(assistant_msg)

@router.get("/history", response_model=List[ChatMessageOut])
def get_chat_history(
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ChatMessage).join(ChatSession).filter(ChatSession.user_id == current_user.id)
    if session_id:
        query = query.filter(ChatMessage.session_id == session_id)
    
    messages = query.order_by(ChatMessage.created_at.asc()).limit(100).all()
    return [ChatMessageOut.model_validate(m) for m in messages]

@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
    for s in sessions:
        db.delete(s)
    db.commit()
    return {"message": "Chat conversation history cleared."}
