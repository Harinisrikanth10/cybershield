import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Course(Base):
    __tablename__ = "learn_courses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False, default="ShieldAlert")
    estimated_minutes = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.order_index")
    quizzes = relationship("QuizQuestion", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "learn_lessons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("learn_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=0, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    key_takeaways = Column(JSON, nullable=False, default=list)

    course = relationship("Course", back_populates="lessons")

class QuizQuestion(Base):
    __tablename__ = "learn_quiz_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("learn_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # list of strings
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)

    course = relationship("Course", back_populates="quizzes")

class UserLearnProgress(Base):
    __tablename__ = "user_learn_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("learn_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    completed = Column(Boolean, default=False, nullable=False)
    quiz_score = Column(Float, default=0.0, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="learn_progress")
