from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel

class LessonOut(BaseModel):
    id: str
    order_index: int
    title: str
    content: str
    key_takeaways: List[str]

    class Config:
        from_attributes = True

class QuizQuestionOut(BaseModel):
    id: str
    question: str
    options: List[str]

    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    description: str
    icon: str
    estimated_minutes: int
    lessons_count: int
    is_completed: bool = False
    quiz_score: Optional[float] = None

class CourseDetailOut(CourseOut):
    lessons: List[LessonOut] = []
    quizzes: List[QuizQuestionOut] = []

class QuizSubmitRequest(BaseModel):
    course_id: str
    # mapping of question_id to selected option index (0, 1, 2, 3)
    answers: Dict[str, int]

class QuizQuestionResult(BaseModel):
    question_id: str
    question: str
    user_answer: int
    correct_answer: int
    is_correct: bool
    explanation: str

class QuizResultResponse(BaseModel):
    course_id: str
    score_percentage: float
    passed: bool
    total_questions: int
    correct_count: int
    details: List[QuizQuestionResult]
