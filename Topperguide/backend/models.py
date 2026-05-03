from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# Request Models
class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SyllabusUpload(BaseModel):
    subject_id: int
    content: str

class PaperAnalysisRequest(BaseModel):
    subject_id: int
    year: int

class StudyPlanRequest(BaseModel):
    subject_id: int
    duration_days: int = Field(ge=1, le=365)
    daily_hours: float = Field(ge=0.5, le=16)

class PracticeQuestionRequest(BaseModel):
    topic: str
    difficulty: str = "medium"  # easy, medium, hard
    count: int = Field(default=5, ge=1, le=20)

# Response Models
class SubjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    paper_count: int = 0
    
    class Config:
        from_attributes = True

class PaperResponse(BaseModel):
    id: int
    subject_id: int
    year: int
    filename: str
    analysis: Optional[Dict]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TopicRankingResponse(BaseModel):
    topic: str
    frequency: int
    importance_score: float
    avg_marks: Optional[float]
    difficulty_distribution: Dict[str, int]
    year_wise_frequency: Dict[int, int]
    trend: str
    last_appeared: int

class SyllabusMapResponse(BaseModel):
    covered_topics: List[str]
    uncovered_topics: List[str]
    coverage_percentage: float
    recommendations: List[str]

class AnalyticsSummary(BaseModel):
    total_papers: int
    total_questions: int
    year_range: Dict[str, int]
    topic_distribution: Dict[str, int]
    difficulty_overview: Dict[str, int]
    question_type_distribution: Dict[str, int]
    yearly_trends: List[Dict]

class StudyPlanResponse(BaseModel):
    id: int
    name: str
    duration_days: int
    daily_hours: float
    plan_data: Dict
    created_at: datetime
    
    class Config:
        from_attributes = True

class PracticeQuestionResponse(BaseModel):
    topic: str
    difficulty: str
    questions: List[Dict]

class UploadResponse(BaseModel):
    success: bool
    message: str
    paper_id: Optional[int] = None
    extracted_text_preview: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
