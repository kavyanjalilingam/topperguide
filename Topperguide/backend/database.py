from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import config

engine = create_engine(config.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    syllabi = relationship("Syllabus", back_populates="subject")
    papers = relationship("PastPaper", back_populates="subject")

class Syllabus(Base):
    __tablename__ = "syllabi"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    content = Column(Text)
    topics = Column(JSON)  # List of topics with hierarchy
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subject = relationship("Subject", back_populates="syllabi")

class PastPaper(Base):
    __tablename__ = "past_papers"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    year = Column(Integer)
    filename = Column(String(500))
    file_path = Column(String(1000))
    extracted_text = Column(Text)
    analysis = Column(JSON)  # Structured analysis data
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subject = relationship("Subject", back_populates="papers")
    questions = relationship("Question", back_populates="paper")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("past_papers.id"))
    question_number = Column(String(50))
    question_text = Column(Text)
    topic = Column(String(255))
    subtopic = Column(String(255), nullable=True)
    difficulty = Column(String(50))  # easy, medium, hard
    marks = Column(Integer, nullable=True)
    question_type = Column(String(100))  # mcq, short_answer, long_answer, numerical
    keywords = Column(JSON)  # List of keywords
    
    paper = relationship("PastPaper", back_populates="questions")

class TopicAnalysis(Base):
    __tablename__ = "topic_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    topic = Column(String(255))
    frequency = Column(Integer)
    importance_score = Column(Float)
    year_wise_data = Column(JSON)  # {year: count}
    avg_marks = Column(Float, nullable=True)
    difficulty_distribution = Column(JSON)  # {easy: x, medium: y, hard: z}
    last_appeared = Column(Integer)  # Last year it appeared
    trend = Column(String(50))  # increasing, decreasing, stable

class StudyPlan(Base):
    __tablename__ = "study_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    name = Column(String(255))
    duration_days = Column(Integer)
    daily_hours = Column(Float)
    plan_data = Column(JSON)  # Structured study plan
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
