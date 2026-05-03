import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from config import config
from database import (
    init_db, get_db, Subject, Syllabus, PastPaper, Question, TopicAnalysis, StudyPlan
)
from models import (
    SubjectCreate, SyllabusUpload, StudyPlanRequest, PracticeQuestionRequest,
    SubjectResponse, PaperResponse, TopicRankingResponse, SyllabusMapResponse,
    AnalyticsSummary, StudyPlanResponse, PracticeQuestionResponse, UploadResponse
)
from services.document_processor import DocumentProcessor, TextCleaner
from services.ai_analyzer import AIAnalyzer
from utils import aggregate_topic_data, rank_topics, generate_analytics_summary

# Initialize FastAPI app
app = FastAPI(
    title="TopperGuide - Past Paper Analyzer",
    description="AI-powered system for analyzing past papers, identifying patterns, and generating smart study plans",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(config.UPLOAD_DIR, exist_ok=True)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# ==================== Subject Endpoints ====================

@app.post("/api/subjects", response_model=SubjectResponse, tags=["Subjects"])
async def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    """Create a new subject"""
    existing = db.query(Subject).filter(Subject.name == subject.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject already exists")
    
    db_subject = Subject(name=subject.name, description=subject.description)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    
    return SubjectResponse(
        id=db_subject.id,
        name=db_subject.name,
        description=db_subject.description,
        created_at=db_subject.created_at,
        paper_count=0
    )

@app.get("/api/subjects", response_model=List[SubjectResponse], tags=["Subjects"])
async def list_subjects(db: Session = Depends(get_db)):
    """List all subjects"""
    subjects = db.query(Subject).all()
    result = []
    for s in subjects:
        paper_count = db.query(PastPaper).filter(PastPaper.subject_id == s.id).count()
        result.append(SubjectResponse(
            id=s.id,
            name=s.name,
            description=s.description,
            created_at=s.created_at,
            paper_count=paper_count
        ))
    return result

@app.get("/api/subjects/{subject_id}", response_model=SubjectResponse, tags=["Subjects"])
async def get_subject(subject_id: int, db: Session = Depends(get_db)):
    """Get subject by ID"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    paper_count = db.query(PastPaper).filter(PastPaper.subject_id == subject_id).count()
    return SubjectResponse(
        id=subject.id,
        name=subject.name,
        description=subject.description,
        created_at=subject.created_at,
        paper_count=paper_count
    )

# ==================== Syllabus Endpoints ====================

@app.post("/api/syllabus/upload", tags=["Syllabus"])
async def upload_syllabus(
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload syllabus document for a subject"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Save file
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    file_path = os.path.join(config.UPLOAD_DIR, f"syllabus_{subject_id}_{uuid.uuid4()}{file_ext}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text
    text = DocumentProcessor.process_document(file_path)
    text = TextCleaner.clean_text(text)
    
    # Extract structured topics using AI
    topics = AIAnalyzer.extract_syllabus_topics(text, subject.name)
    
    # Save to database
    syllabus = Syllabus(
        subject_id=subject_id,
        content=text,
        topics=topics
    )
    db.add(syllabus)
    db.commit()
    db.refresh(syllabus)
    
    return {
        "success": True,
        "syllabus_id": syllabus.id,
        "topics_extracted": topics
    }

@app.get("/api/syllabus/{subject_id}", tags=["Syllabus"])
async def get_syllabus(subject_id: int, db: Session = Depends(get_db)):
    """Get syllabus for a subject"""
    syllabus = db.query(Syllabus).filter(Syllabus.subject_id == subject_id).order_by(Syllabus.created_at.desc()).first()
    if not syllabus:
        raise HTTPException(status_code=404, detail="Syllabus not found")
    
    return {
        "id": syllabus.id,
        "subject_id": syllabus.subject_id,
        "topics": syllabus.topics,
        "created_at": syllabus.created_at
    }

# ==================== Paper Upload & Analysis Endpoints ====================

@app.post("/api/papers/upload", response_model=UploadResponse, tags=["Papers"])
async def upload_paper(
    subject_id: int = Form(...),
    year: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and analyze a past paper"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Validate file
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Save file
    unique_filename = f"{subject_id}_{year}_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(config.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text
    text = DocumentProcessor.process_document(file_path)
    text = TextCleaner.clean_text(text)
    
    if not text or len(text) < 50:
        return UploadResponse(
            success=False,
            message="Could not extract sufficient text from the document. Please ensure the file is readable."
        )
    
    # Analyze paper using AI
    analysis = AIAnalyzer.analyze_paper(text, subject.name, year)
    
    # Save paper to database
    paper = PastPaper(
        subject_id=subject_id,
        year=year,
        filename=file.filename,
        file_path=file_path,
        extracted_text=text,
        analysis=analysis
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    
    # Save individual questions
    if "questions" in analysis:
        for q in analysis["questions"]:
            question = Question(
                paper_id=paper.id,
                question_number=q.get("question_number", ""),
                question_text=q.get("question_text", ""),
                topic=q.get("topic", "Unknown"),
                subtopic=q.get("subtopic"),
                difficulty=q.get("difficulty", "medium"),
                marks=q.get("estimated_marks"),
                question_type=q.get("question_type", "unknown"),
                keywords=q.get("keywords", [])
            )
            db.add(question)
        db.commit()
    
    return UploadResponse(
        success=True,
        message=f"Paper uploaded and analyzed successfully. Found {len(analysis.get('questions', []))} questions.",
        paper_id=paper.id,
        extracted_text_preview=text[:500]
    )

@app.post("/api/papers/upload-multiple", tags=["Papers"])
async def upload_multiple_papers(
    subject_id: int = Form(...),
    files: List[UploadFile] = File(...),
    years: str = Form(...),  # Comma-separated years
    db: Session = Depends(get_db)
):
    """Upload multiple past papers at once"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    year_list = [int(y.strip()) for y in years.split(",")]
    
    if len(files) != len(year_list):
        raise HTTPException(status_code=400, detail="Number of files must match number of years")
    
    results = []
    for file, year in zip(files, year_list):
        try:
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in config.ALLOWED_EXTENSIONS:
                results.append({"filename": file.filename, "success": False, "message": "Unsupported file type"})
                continue
            
            unique_filename = f"{subject_id}_{year}_{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(config.UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            text = DocumentProcessor.process_document(file_path)
            text = TextCleaner.clean_text(text)
            
            analysis = AIAnalyzer.analyze_paper(text, subject.name, year)
            
            paper = PastPaper(
                subject_id=subject_id,
                year=year,
                filename=file.filename,
                file_path=file_path,
                extracted_text=text,
                analysis=analysis
            )
            db.add(paper)
            db.commit()
            db.refresh(paper)
            
            # Save questions
            if "questions" in analysis:
                for q in analysis["questions"]:
                    question = Question(
                        paper_id=paper.id,
                        question_number=q.get("question_number", ""),
                        question_text=q.get("question_text", ""),
                        topic=q.get("topic", "Unknown"),
                        subtopic=q.get("subtopic"),
                        difficulty=q.get("difficulty", "medium"),
                        marks=q.get("estimated_marks"),
                        question_type=q.get("question_type", "unknown"),
                        keywords=q.get("keywords", [])
                    )
                    db.add(question)
                db.commit()
            
            results.append({
                "filename": file.filename,
                "year": year,
                "success": True,
                "paper_id": paper.id,
                "questions_found": len(analysis.get("questions", []))
            })
        except Exception as e:
            results.append({"filename": file.filename, "success": False, "message": str(e)})
    
    return {"results": results, "total_uploaded": sum(1 for r in results if r["success"])}

@app.get("/api/papers/{subject_id}", response_model=List[PaperResponse], tags=["Papers"])
async def list_papers(subject_id: int, db: Session = Depends(get_db)):
    """List all papers for a subject"""
    papers = db.query(PastPaper).filter(PastPaper.subject_id == subject_id).order_by(PastPaper.year.desc()).all()
    return papers

@app.get("/api/papers/{paper_id}/details", tags=["Papers"])
async def get_paper_details(paper_id: int, db: Session = Depends(get_db)):
    """Get detailed analysis of a specific paper"""
    paper = db.query(PastPaper).filter(PastPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    questions = db.query(Question).filter(Question.paper_id == paper_id).all()
    
    return {
        "paper": {
            "id": paper.id,
            "year": paper.year,
            "filename": paper.filename,
            "analysis": paper.analysis
        },
        "questions": [
            {
                "id": q.id,
                "number": q.question_number,
                "text": q.question_text,
                "topic": q.topic,
                "subtopic": q.subtopic,
                "difficulty": q.difficulty,
                "marks": q.marks,
                "type": q.question_type,
                "keywords": q.keywords
            }
            for q in questions
        ]
    }

# ==================== Analysis Endpoints ====================

@app.get("/api/analysis/topic-rankings/{subject_id}", tags=["Analysis"])
async def get_topic_rankings(subject_id: int, db: Session = Depends(get_db)):
    """Get ranked topics by importance for a subject"""
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this subject")
    
    # Convert to dict format
    question_data = []
    for q in questions:
        paper = db.query(PastPaper).filter(PastPaper.id == q.paper_id).first()
        question_data.append({
            'topic': q.topic,
            'difficulty': q.difficulty,
            'marks': q.marks,
            'question_type': q.question_type,
            'year': paper.year if paper else None
        })
    
    # Aggregate and rank
    topic_data = aggregate_topic_data(question_data)
    rankings = rank_topics(topic_data)
    
    return {"rankings": rankings, "total_topics": len(rankings)}

@app.get("/api/analysis/syllabus-mapping/{subject_id}", tags=["Analysis"])
async def get_syllabus_mapping(subject_id: int, db: Session = Depends(get_db)):
    """Map analyzed questions to syllabus topics"""
    syllabus = db.query(Syllabus).filter(Syllabus.subject_id == subject_id).order_by(Syllabus.created_at.desc()).first()
    if not syllabus:
        raise HTTPException(status_code=404, detail="Syllabus not found. Please upload syllabus first.")
    
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found. Please upload past papers first.")
    
    question_data = [{"topic": q.topic, "subtopic": q.subtopic} for q in questions]
    
    mapping = AIAnalyzer.map_topics_to_syllabus(question_data, syllabus.topics)
    
    return mapping

@app.get("/api/analysis/predictions/{subject_id}", tags=["Analysis"])
async def get_topic_predictions(subject_id: int, db: Session = Depends(get_db)):
    """Get AI predictions for important topics"""
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No historical data found")
    
    # Prepare historical data
    historical_data = []
    for q in questions:
        paper = db.query(PastPaper).filter(PastPaper.id == q.paper_id).first()
        historical_data.append({
            'topic': q.topic,
            'year': paper.year if paper else None,
            'difficulty': q.difficulty,
            'marks': q.marks,
            'question_type': q.question_type
        })
    
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    predictions = AIAnalyzer.predict_important_topics(historical_data, subject.name)
    
    return predictions

@app.get("/api/analysis/summary/{subject_id}", response_model=AnalyticsSummary, tags=["Analysis"])
async def get_analytics_summary(subject_id: int, db: Session = Depends(get_db)):
    """Get comprehensive analytics summary for a subject"""
    papers = db.query(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found for this subject")
    
    paper_data = [{"id": p.id, "year": p.year} for p in papers]
    question_data = []
    for q in questions:
        paper = db.query(PastPaper).filter(PastPaper.id == q.paper_id).first()
        question_data.append({
            'topic': q.topic,
            'difficulty': q.difficulty,
            'question_type': q.question_type,
            'marks': q.marks,
            'year': paper.year if paper else None
        })
    
    summary = generate_analytics_summary(paper_data, question_data)
    return summary

@app.get("/api/analysis/weak-areas/{subject_id}", tags=["Analysis"])
async def get_weak_areas(subject_id: int, db: Session = Depends(get_db)):
    """Get weak areas based on topic analysis - topics with lower frequency but high marks"""
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    
    if not questions:
        return {"weak_areas": []}
    
    # Analyze topics
    topic_stats = {}
    for q in questions:
        topic = q.topic
        if topic not in topic_stats:
            topic_stats[topic] = {"count": 0, "total_marks": 0, "difficulties": []}
        topic_stats[topic]["count"] += 1
        topic_stats[topic]["total_marks"] += q.marks or 0
        topic_stats[topic]["difficulties"].append(q.difficulty)
    
    # Find weak areas: topics that appear less but have high marks or hard difficulty
    weak_areas = []
    avg_count = sum(s["count"] for s in topic_stats.values()) / len(topic_stats) if topic_stats else 0
    
    for topic, stats in topic_stats.items():
        hard_ratio = stats["difficulties"].count("hard") / len(stats["difficulties"]) if stats["difficulties"] else 0
        avg_marks = stats["total_marks"] / stats["count"] if stats["count"] else 0
        
        # Weak if: less frequent than average OR high hard ratio OR high marks per question
        if stats["count"] < avg_count or hard_ratio > 0.3 or avg_marks > 10:
            weak_areas.append({
                "topic": topic,
                "frequency": stats["count"],
                "avg_marks": round(avg_marks, 1),
                "hard_ratio": round(hard_ratio * 100, 1),
                "reason": "High difficulty" if hard_ratio > 0.3 else "High marks allocation" if avg_marks > 10 else "Low frequency"
            })
    
    # Sort by importance (hard ratio + avg_marks)
    weak_areas.sort(key=lambda x: x["hard_ratio"] + x["avg_marks"], reverse=True)
    
    return {"weak_areas": weak_areas[:10]}

# ==================== Study Planner Endpoints ====================

@app.post("/api/study-plan/generate", response_model=StudyPlanResponse, tags=["Study Planner"])
async def generate_study_plan(request: StudyPlanRequest, db: Session = Depends(get_db)):
    """Generate a smart study plan based on topic rankings"""
    # Get topic rankings
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == request.subject_id).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No analysis data found. Please upload papers first.")
    
    question_data = []
    for q in questions:
        paper = db.query(PastPaper).filter(PastPaper.id == q.paper_id).first()
        question_data.append({
            'topic': q.topic,
            'difficulty': q.difficulty,
            'marks': q.marks,
            'year': paper.year if paper else None
        })
    
    topic_data = aggregate_topic_data(question_data)
    rankings = rank_topics(topic_data)
    
    # Get syllabus if available
    syllabus = db.query(Syllabus).filter(Syllabus.subject_id == request.subject_id).first()
    syllabus_topics = syllabus.topics if syllabus else None
    
    # Generate plan using AI
    plan_data = AIAnalyzer.generate_study_plan(
        rankings,
        request.duration_days,
        request.daily_hours,
        syllabus_topics
    )
    
    # Save plan
    study_plan = StudyPlan(
        subject_id=request.subject_id,
        name=plan_data.get("plan_name", "Study Plan"),
        duration_days=request.duration_days,
        daily_hours=request.daily_hours,
        plan_data=plan_data
    )
    db.add(study_plan)
    db.commit()
    db.refresh(study_plan)
    
    return study_plan

@app.get("/api/study-plan/{subject_id}", tags=["Study Planner"])
async def get_study_plans(subject_id: int, db: Session = Depends(get_db)):
    """Get all study plans for a subject"""
    plans = db.query(StudyPlan).filter(StudyPlan.subject_id == subject_id).order_by(StudyPlan.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "duration_days": p.duration_days,
            "daily_hours": p.daily_hours,
            "plan_data": p.plan_data,
            "created_at": p.created_at
        }
        for p in plans
    ]

# ==================== Practice Questions Endpoints ====================

@app.get("/api/practice/{subject_id}", tags=["Practice"])
async def get_practice_questions(subject_id: int, db: Session = Depends(get_db)):
    """Get all saved questions for a subject that can be used for practice"""
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    
    return {
        "questions": [
            {
                "id": q.id,
                "question": q.question_text,
                "topic": q.topic,
                "difficulty": q.difficulty,
                "marks": q.marks,
                "question_type": q.question_type,
                "answer": "Review your textbook for this topic",
                "explanation": f"This is a {q.difficulty} level question on {q.topic}"
            }
            for q in questions
        ]
    }

@app.post("/api/practice/generate", tags=["Practice"])
async def generate_practice_questions_endpoint(
    subject_id: int = None,
    topic: str = None,
    difficulty: str = "medium",
    count: int = 5,
    db: Session = Depends(get_db)
):
    """Generate practice questions for a topic or subject"""
    # If subject_id provided but no topic, get the top topic
    if subject_id and not topic:
        questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
        if questions:
            # Get most frequent topic
            topics = [q.topic for q in questions]
            topic = max(set(topics), key=topics.count)
        else:
            topic = "General"
    
    if not topic:
        topic = "General"
    
    result = AIAnalyzer.generate_practice_questions(topic, difficulty, count)
    return result

@app.get("/api/practice/similar/{question_id}", tags=["Practice"])
async def get_similar_questions(question_id: int, count: int = 3, db: Session = Depends(get_db)):
    """Get similar practice questions based on an existing question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    result = AIAnalyzer.generate_practice_questions(
        question.topic,
        question.difficulty,
        count
    )
    
    return {
        "original_question": {
            "id": question.id,
            "text": question.question_text,
            "topic": question.topic
        },
        "similar_questions": result.get("questions", [])
    }

# ==================== Dashboard Data Endpoints ====================

@app.get("/api/dashboard/{subject_id}", tags=["Dashboard"])
async def get_dashboard_data(subject_id: int, db: Session = Depends(get_db)):
    """Get all dashboard data in one call"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    papers = db.query(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    questions = db.query(Question).join(PastPaper).filter(PastPaper.subject_id == subject_id).all()
    syllabus = db.query(Syllabus).filter(Syllabus.subject_id == subject_id).first()
    
    # Topic rankings
    question_data = []
    for q in questions:
        paper = db.query(PastPaper).filter(PastPaper.id == q.paper_id).first()
        question_data.append({
            'topic': q.topic,
            'difficulty': q.difficulty,
            'marks': q.marks,
            'question_type': q.question_type,
            'year': paper.year if paper else None
        })
    
    topic_data = aggregate_topic_data(question_data) if question_data else {}
    rankings = rank_topics(topic_data) if topic_data else []
    
    # Summary stats
    paper_data = [{"id": p.id, "year": p.year} for p in papers]
    summary = generate_analytics_summary(paper_data, question_data) if papers else {}
    
    return {
        "subject": {
            "id": subject.id,
            "name": subject.name,
            "description": subject.description
        },
        "stats": {
            "total_papers": len(papers),
            "total_questions": len(questions),
            "has_syllabus": syllabus is not None,
            "years_covered": list(set(p.year for p in papers))
        },
        "topic_rankings": rankings[:20],  # Top 20 topics
        "analytics_summary": summary,
        "recent_papers": [
            {"id": p.id, "year": p.year, "filename": p.filename}
            for p in sorted(papers, key=lambda x: x.year, reverse=True)[:5]
        ]
    }

# Health check
@app.get("/api/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)