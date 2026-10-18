from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.learn import Course, Lesson, QuizQuestion, UserLearnProgress
from app.schemas.learn import (
    CourseOut,
    CourseDetailOut,
    LessonOut,
    QuizQuestionOut,
    QuizSubmitRequest,
    QuizResultResponse,
    QuizQuestionResult,
)

router = APIRouter(prefix="/learn", tags=["Security Education"])

@router.get("", response_model=List[CourseOut])
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).order_by(Course.created_at.asc()).all()
    progress_map = {
        p.course_id: p
        for p in db.query(UserLearnProgress).filter(UserLearnProgress.user_id == current_user.id).all()
    }

    result = []
    for c in courses:
        p = progress_map.get(c.id)
        result.append(CourseOut(
            id=c.id,
            slug=c.slug,
            title=c.title,
            category=c.category,
            description=c.description,
            icon=c.icon,
            estimated_minutes=c.estimated_minutes,
            lessons_count=len(c.lessons),
            is_completed=p.completed if p else False,
            quiz_score=p.quiz_score if p else None,
        ))
    return result

@router.get("/{slug}", response_model=CourseDetailOut)
def get_course_detail(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning module not found.")

    p = db.query(UserLearnProgress).filter(
        UserLearnProgress.user_id == current_user.id,
        UserLearnProgress.course_id == course.id,
    ).first()

    return CourseDetailOut(
        id=course.id,
        slug=course.slug,
        title=course.title,
        category=course.category,
        description=course.description,
        icon=course.icon,
        estimated_minutes=course.estimated_minutes,
        lessons_count=len(course.lessons),
        is_completed=p.completed if p else False,
        quiz_score=p.quiz_score if p else None,
        lessons=[LessonOut.model_validate(l) for l in sorted(course.lessons, key=lambda x: x.order_index)],
        quizzes=[
            QuizQuestionOut(
                id=q.id,
                question=q.question,
                options=q.options,
            )
            for q in course.quizzes
        ],
    )

@router.post("/quiz/submit", response_model=QuizResultResponse)
def submit_quiz(
    req: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    quizzes = course.quizzes
    if not quizzes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No quiz registered for this course.")

    correct_count = 0
    details = []

    for q in quizzes:
        user_choice = req.answers.get(q.id, -1)
        is_correct = (user_choice == q.correct_option_index)
        if is_correct:
            correct_count += 1
        
        details.append(QuizQuestionResult(
            question_id=q.id,
            question=q.question,
            user_answer=user_choice,
            correct_answer=q.correct_option_index,
            is_correct=is_correct,
            explanation=q.explanation,
        ))

    score_pct = round((correct_count / len(quizzes)) * 100, 1)
    passed = score_pct >= 70.0

    # Save or update progress
    progress = db.query(UserLearnProgress).filter(
        UserLearnProgress.user_id == current_user.id,
        UserLearnProgress.course_id == course.id,
    ).first()

    if not progress:
        progress = UserLearnProgress(
            user_id=current_user.id,
            course_id=course.id,
            completed=passed,
            quiz_score=score_pct,
            completed_at=datetime.now(timezone.utc) if passed else None,
        )
        db.add(progress)
    else:
        if score_pct > progress.quiz_score:
            progress.quiz_score = score_pct
        if passed and not progress.completed:
            progress.completed = True
            progress.completed_at = datetime.now(timezone.utc)

    db.commit()

    return QuizResultResponse(
        course_id=course.id,
        score_percentage=score_pct,
        passed=passed,
        total_questions=len(quizzes),
        correct_count=correct_count,
        details=details,
    )

@router.get("/progress/overview")
def get_learning_progress_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_courses = db.query(Course).count()
    completed_courses = db.query(UserLearnProgress).filter(
        UserLearnProgress.user_id == current_user.id,
        UserLearnProgress.completed == True,
    ).count()

    pct = round((completed_courses / total_courses) * 100, 1) if total_courses > 0 else 0.0
    return {
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "completion_percentage": pct,
    }
