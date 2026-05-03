import json
import re
from typing import List, Dict, Optional
from openai import OpenAI
from config import config

# Initialize OpenAI client
client = OpenAI(api_key=config.OPENAI_API_KEY)

class AIAnalyzer:
    """AI-powered analysis using OpenAI GPT"""
    
    @staticmethod
    def _query_openai(prompt: str, system_prompt: str = "") -> str:
        """Query OpenAI with a prompt and return the response"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = client.chat.completions.create(
                model=config.OPENAI_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=4000
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI query error: {e}")
            return ""
    
    @staticmethod
    def _extract_json(text: str) -> Dict:
        """Extract JSON from text response"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group())
            return {}
        except json.JSONDecodeError:
            print(f"JSON parse error in: {text[:200]}")
            return {}
    
    @staticmethod
    def analyze_paper(text: str, subject: str, year: int) -> Dict:
        """Comprehensive analysis of a past paper"""
        
        prompt = f"""Analyze this past examination paper for {subject} from year {year}.

PAPER TEXT:
{text[:8000]}

You MUST respond with ONLY valid JSON (no markdown, no explanation). Follow this exact structure:
{{
    "questions": [
        {{
            "question_number": "1",
            "question_text": "brief summary of question",
            "topic": "main topic",
            "subtopic": "specific subtopic if applicable",
            "difficulty": "easy/medium/hard",
            "estimated_marks": 5,
            "question_type": "mcq/short_answer/long_answer/numerical/essay",
            "keywords": ["keyword1", "keyword2"],
            "concepts_tested": ["concept1", "concept2"]
        }}
    ],
    "paper_summary": {{
        "total_questions": 10,
        "total_marks": 100,
        "difficulty_distribution": {{"easy": 3, "medium": 5, "hard": 2}},
        "question_type_distribution": {{"mcq": 5, "short_answer": 3, "long_answer": 2}},
        "main_topics_covered": ["topic1", "topic2"],
        "notable_patterns": ["pattern observation 1", "pattern observation 2"]
    }}
}}

Extract ALL questions you can find. Respond with ONLY the JSON object."""

        system_prompt = "You are an expert academic analyst. You MUST respond with ONLY valid JSON, no markdown formatting, no explanations."
        
        response = AIAnalyzer._query_openai(prompt, system_prompt)
        result = AIAnalyzer._extract_json(response)
        
        if not result:
            return {"error": "Failed to parse response", "questions": [], "paper_summary": {}}
        return result
    
    @staticmethod
    def extract_syllabus_topics(syllabus_text: str, subject: str) -> Dict:
        """Extract structured topics from syllabus text"""
        
        prompt = f"""Extract a structured topic hierarchy from this {subject} syllabus.

SYLLABUS TEXT:
{syllabus_text[:6000]}

Respond with ONLY valid JSON (no markdown):
{{
    "subject": "{subject}",
    "units": [
        {{
            "unit_number": 1,
            "unit_name": "Unit Name",
            "topics": [
                {{
                    "topic_name": "Main Topic",
                    "subtopics": ["subtopic1", "subtopic2"],
                    "estimated_weightage": 15,
                    "learning_objectives": ["objective1", "objective2"]
                }}
            ]
        }}
    ],
    "total_topics": 25,
    "key_areas": ["important area 1", "important area 2"]
}}"""

        system_prompt = "You are an expert curriculum analyst. Respond with ONLY valid JSON."
        
        response = AIAnalyzer._query_openai(prompt, system_prompt)
        result = AIAnalyzer._extract_json(response)
        
        if not result:
            return {"error": "Failed to parse", "units": []}
        return result
    
    @staticmethod
    def map_topics_to_syllabus(questions: List[Dict], syllabus_topics: Dict) -> Dict:
        """Map extracted questions to syllabus topics"""
        
        all_topics = []
        if "units" in syllabus_topics:
            for unit in syllabus_topics["units"]:
                for topic in unit.get("topics", []):
                    all_topics.append(topic["topic_name"])
                    all_topics.extend(topic.get("subtopics", []))
        
        prompt = f"""Map these exam questions to syllabus topics and identify gaps.

EXAM QUESTIONS (topics found):
{json.dumps([q.get('topic', '') for q in questions[:30]], indent=2)}

SYLLABUS TOPICS:
{json.dumps(all_topics[:50], indent=2)}

Respond with ONLY valid JSON:
{{
    "mapped_topics": [
        {{
            "exam_topic": "topic from exam",
            "syllabus_topic": "matching syllabus topic",
            "match_confidence": 0.95
        }}
    ],
    "coverage_analysis": {{
        "covered_topics": ["topic1", "topic2"],
        "uncovered_topics": ["topic3", "topic4"],
        "coverage_percentage": 75
    }},
    "recommendations": ["recommendation1", "recommendation2"]
}}"""

        system_prompt = "You are an expert in curriculum mapping. Respond with ONLY valid JSON."
        
        response = AIAnalyzer._query_openai(prompt, system_prompt)
        result = AIAnalyzer._extract_json(response)
        
        if not result:
            return {"error": "Failed to parse"}
        return result
    
    @staticmethod
    def calculate_topic_importance(topic_data: Dict) -> float:
        """Calculate importance score for a topic based on various factors"""
        
        frequency = topic_data.get('frequency', 0)
        recency = topic_data.get('recency_score', 0)
        avg_marks = topic_data.get('avg_marks', 0)
        trend = topic_data.get('trend', 'stable')
        
        freq_weight = 0.35
        recency_weight = 0.25
        marks_weight = 0.25
        trend_weight = 0.15
        
        freq_score = min(frequency / 20, 1.0) * 100
        recency_score = recency
        marks_score = min(avg_marks / 20, 1.0) * 100
        
        trend_multiplier = {
            'increasing': 1.2,
            'stable': 1.0,
            'decreasing': 0.8
        }.get(trend, 1.0)
        
        base_score = (
            freq_score * freq_weight +
            recency_score * recency_weight +
            marks_score * marks_weight
        )
        
        final_score = base_score * trend_multiplier
        return min(round(final_score, 2), 100)
    
    @staticmethod
    def generate_study_plan(
        topic_rankings: List[Dict],
        duration_days: int,
        daily_hours: float,
        syllabus_topics: Optional[Dict] = None
    ) -> Dict:
        """Generate a smart study plan based on topic importance"""
        
        prompt = f"""Create a comprehensive, detailed study plan based on topic importance rankings from past paper analysis.

TOPIC RANKINGS (by importance/frequency in past exams):
{json.dumps(topic_rankings[:20], indent=2)}

CONSTRAINTS:
- Total duration: {duration_days} days
- Daily study hours: {daily_hours} hours
- Total available hours: {duration_days * daily_hours} hours

Generate a DETAILED study plan with:
1. A clear strategic approach explaining WHY topics are prioritized this way
2. Multiple phases (e.g., High Priority, Medium Priority, Revision, Mock Tests)
3. Daily breakdown within each phase with specific activities
4. Practical tips based on the exam pattern
5. Weekly review checkpoints
6. Key milestones to track progress

Respond with ONLY valid JSON:
{{
    "plan_name": "AI-Optimized Study Plan for [Subject]",
    "total_days": {duration_days},
    "daily_hours": {daily_hours},
    "strategy": "A 2-3 sentence explanation of the overall approach, e.g., 'Based on past paper analysis, we prioritize topics X, Y, Z which appear most frequently. The plan allocates 60% time to high-yield topics, 25% to medium priority, and 15% to revision and mock tests.'",
    "phases": [
        {{
            "phase_name": "High Priority Topics (Foundation)",
            "days": [1, 10],
            "priority": "high",
            "topics": ["topic1", "topic2", "topic3"],
            "milestones": [
                {{"title": "Complete topic 1 theory + 20 questions", "duration": "2 days"}},
                {{"title": "Solve 3 past paper questions on topic 2", "duration": "1 day"}}
            ],
            "daily_breakdown": [
                {{
                    "day": 1,
                    "topics": ["topic1"],
                    "hours": {daily_hours},
                    "activities": ["Read theory (2h)", "Make notes (1h)", "Practice 10 MCQs (1h)"],
                    "goals": ["Understand core concepts", "Complete chapter summary"]
                }},
                {{
                    "day": 2,
                    "topics": ["topic1", "topic2"],
                    "hours": {daily_hours},
                    "activities": ["Revise topic1 notes (30m)", "Start topic2 theory (2h)", "Solve numericals (1.5h)"],
                    "goals": ["Master topic1 formulas", "Begin topic2"]
                }}
            ],
            "tips": "Focus on understanding derivations for topic1 as they often appear as 5+ mark questions"
        }}
    ],
    "weekly_reviews": [
        {{
            "week": 1,
            "review_topics": ["topic1", "topic2", "topic3"],
            "practice_focus": ["MCQs on formulas", "Numerical problems", "Definition questions"]
        }}
    ],
    "tips": [
        "Topic X frequently appears as a 10-mark question - prepare a structured answer format",
        "For numerical problems, first identify the formula needed before solving",
        "Review weak areas every 3 days to reinforce learning",
        "Take a full mock test at the end of week 2 to identify gaps"
    ],
    "milestones": [
        {{
            "day": {duration_days // 3},
            "milestone": "Complete all high-priority topics with practice questions",
            "self_test": "Solve last year's paper Section A"
        }},
        {{
            "day": {duration_days * 2 // 3},
            "milestone": "Finish medium priority topics and first revision cycle",
            "self_test": "Full mock test under exam conditions"
        }},
        {{
            "day": {duration_days},
            "milestone": "Final revision and confidence building",
            "self_test": "Quick review of key formulas and common mistakes"
        }}
    ]
}}"""

        system_prompt = """You are an expert study planner and exam preparation coach. Create highly practical, 
achievable study plans that:
- Prioritize topics based on their exam importance/frequency
- Include specific daily activities with time allocations
- Provide actionable tips based on exam patterns
- Set clear milestones to track progress
- Balance learning new topics with revision

Respond with ONLY valid JSON. Be specific and detailed in your recommendations."""
        
        response = AIAnalyzer._query_openai(prompt, system_prompt)
        result = AIAnalyzer._extract_json(response)
        
        if not result:
            return AIAnalyzer._generate_fallback_plan(topic_rankings, duration_days, daily_hours)
        return result
    
    @staticmethod
    def _generate_fallback_plan(topic_rankings: List[Dict], duration_days: int, daily_hours: float) -> Dict:
        """Generate a basic fallback plan if AI fails"""
        high_priority = topic_rankings[:len(topic_rankings)//3] if topic_rankings else []
        medium_priority = topic_rankings[len(topic_rankings)//3:2*len(topic_rankings)//3] if topic_rankings else []
        
        return {
            "plan_name": "Optimized Study Plan",
            "total_days": duration_days,
            "daily_hours": daily_hours,
            "strategy": "Focus on high-yield topics first based on past paper analysis",
            "phases": [
                {
                    "phase_name": "High Priority Topics",
                    "days": [1, duration_days // 2],
                    "topics": [t.get('topic', '') for t in high_priority[:5]],
                    "daily_breakdown": []
                },
                {
                    "phase_name": "Medium Priority & Revision",
                    "days": [duration_days // 2 + 1, duration_days],
                    "topics": [t.get('topic', '') for t in medium_priority[:5]],
                    "daily_breakdown": []
                }
            ],
            "tips": [
                "Focus on understanding concepts, not just memorization",
                "Practice past paper questions daily",
                "Review weak areas regularly"
            ],
            "milestones": [
                {"day": duration_days // 2, "milestone": "Complete high priority topics", "self_test": "Mock test"}
            ]
        }
    
    @staticmethod
    def generate_practice_questions(topic: str, difficulty: str, count: int = 5) -> Dict:
        """Generate practice questions for a topic"""
        
        prompt = f"""Generate {count} practice exam questions for the topic: {topic}
Difficulty level: {difficulty}

Create diverse question types. Respond with ONLY valid JSON:
{{
    "topic": "{topic}",
    "difficulty": "{difficulty}",
    "questions": [
        {{
            "question_number": 1,
            "question_text": "Full question text",
            "question_type": "mcq/short_answer/long_answer/numerical",
            "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
            "answer": "correct answer or solution approach",
            "explanation": "detailed explanation",
            "marks": 5,
            "time_suggested": "5 minutes"
        }}
    ]
}}"""

        system_prompt = "You are an expert exam question creator. Create challenging but fair questions. Respond with ONLY valid JSON."
        
        response = AIAnalyzer._query_openai(prompt, system_prompt)
        result = AIAnalyzer._extract_json(response)
        
        if not result or "questions" not in result:
            return {"topic": topic, "difficulty": difficulty, "questions": []}
        return result
    
    @staticmethod
    def predict_important_topics(historical_data: List[Dict], subject: str) -> Dict:
        """Predict which topics are likely to appear in upcoming exams"""
        
        prompt = f"""Based on historical exam data for {subject}, predict important topics for upcoming exams.

HISTORICAL DATA:
{json.dumps(historical_data[:30], indent=2)}

Analyze patterns and respond with ONLY valid JSON:
{{
    "predicted_high_probability_topics": [
        {{
            "topic": "topic name",
            "probability": 0.85,
            "reasoning": "appeared in 4 of last 5 years",
            "suggested_preparation": "focus areas"
        }}
    ],
    "emerging_topics": [
        {{
            "topic": "topic name",
            "trend": "increasing frequency",
            "first_appeared": 2022
        }}
    ],
    "declining_topics": [
        {{
            "topic": "topic name",
            "last_appearance": 2021,
            "recommendation": "lower priority but don't skip"
        }}
    ],
    "prediction_confidence": 0.75,
    "analysis_summary": "Overall analysis of topic trends"
}}"""

        system_prompt = "You are an expert in academic trend analysis and exam prediction. Respond with ONLY valid JSON."
        
        response = AIAnalyzer._query_openai(prompt, system_prompt)
        result = AIAnalyzer._extract_json(response)
        
        if not result:
            return {"error": "Failed to generate predictions", "predicted_high_probability_topics": []}
        return result