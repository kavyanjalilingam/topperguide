from typing import List, Dict
from collections import defaultdict
from database import TopicAnalysis

def calculate_year_trends(year_data: Dict[int, int]) -> str:
    """Calculate if a topic is trending up, down, or stable"""
    if not year_data or len(year_data) < 2:
        return "stable"
    
    years = sorted(year_data.keys())
    if len(years) < 2:
        return "stable"
    
    # Compare recent years to older years
    mid_point = len(years) // 2
    old_avg = sum(year_data[y] for y in years[:mid_point]) / mid_point
    new_avg = sum(year_data[y] for y in years[mid_point:]) / (len(years) - mid_point)
    
    if new_avg > old_avg * 1.2:
        return "increasing"
    elif new_avg < old_avg * 0.8:
        return "decreasing"
    return "stable"

def calculate_recency_score(year_wise_data: Dict[int, int], current_year: int = 2024) -> float:
    """Calculate how recently a topic appeared (0-100)"""
    if not year_wise_data:
        return 0
    
    years = sorted(year_wise_data.keys(), reverse=True)
    most_recent = years[0]
    
    # More recent = higher score
    years_ago = current_year - most_recent
    if years_ago == 0:
        return 100
    elif years_ago == 1:
        return 85
    elif years_ago == 2:
        return 70
    elif years_ago <= 4:
        return 50
    return max(0, 30 - (years_ago - 4) * 5)

def aggregate_topic_data(questions: List[Dict]) -> Dict[str, Dict]:
    """Aggregate question data by topic"""
    topic_data = defaultdict(lambda: {
        'frequency': 0,
        'marks': [],
        'difficulties': defaultdict(int),
        'years': defaultdict(int),
        'question_types': defaultdict(int),
        'questions': []
    })
    
    for q in questions:
        topic = q.get('topic', 'Unknown')
        data = topic_data[topic]
        
        data['frequency'] += 1
        
        if q.get('marks'):
            data['marks'].append(q['marks'])
        
        if q.get('difficulty'):
            data['difficulties'][q['difficulty']] += 1
        
        if q.get('year'):
            data['years'][q['year']] += 1
        
        if q.get('question_type'):
            data['question_types'][q['question_type']] += 1
        
        data['questions'].append(q)
    
    return dict(topic_data)

def rank_topics(topic_data: Dict[str, Dict], current_year: int = 2024) -> List[Dict]:
    """Rank topics by importance score"""
    from services.ai_analyzer import AIAnalyzer
    
    rankings = []
    
    for topic, data in topic_data.items():
        year_wise = dict(data['years'])
        
        topic_info = {
            'topic': topic,
            'frequency': data['frequency'],
            'recency_score': calculate_recency_score(year_wise, current_year),
            'avg_marks': sum(data['marks']) / len(data['marks']) if data['marks'] else 0,
            'trend': calculate_year_trends(year_wise)
        }
        
        importance_score = AIAnalyzer.calculate_topic_importance(topic_info)
        
        rankings.append({
            'topic': topic,
            'frequency': data['frequency'],
            'importance_score': importance_score,
            'avg_marks': topic_info['avg_marks'],
            'difficulty_distribution': dict(data['difficulties']),
            'year_wise_frequency': year_wise,
            'trend': topic_info['trend'],
            'last_appeared': max(year_wise.keys()) if year_wise else 0,
            'question_types': dict(data['question_types'])
        })
    
    # Sort by importance score
    rankings.sort(key=lambda x: x['importance_score'], reverse=True)
    
    return rankings

def generate_analytics_summary(papers: List[Dict], questions: List[Dict]) -> Dict:
    """Generate comprehensive analytics summary"""
    
    years = [p.get('year', 0) for p in papers if p.get('year')]
    topic_counts = defaultdict(int)
    difficulty_counts = defaultdict(int)
    type_counts = defaultdict(int)
    yearly_data = defaultdict(lambda: {'questions': 0, 'topics': set()})
    
    for q in questions:
        topic_counts[q.get('topic', 'Unknown')] += 1
        difficulty_counts[q.get('difficulty', 'unknown')] += 1
        type_counts[q.get('question_type', 'unknown')] += 1
        
        year = q.get('year')
        if year:
            yearly_data[year]['questions'] += 1
            yearly_data[year]['topics'].add(q.get('topic', 'Unknown'))
    
    yearly_trends = [
        {
            'year': year,
            'question_count': data['questions'],
            'unique_topics': len(data['topics'])
        }
        for year, data in sorted(yearly_data.items())
    ]
    
    return {
        'total_papers': len(papers),
        'total_questions': len(questions),
        'year_range': {
            'min': min(years) if years else 0,
            'max': max(years) if years else 0
        },
        'topic_distribution': dict(topic_counts),
        'difficulty_overview': dict(difficulty_counts),
        'question_type_distribution': dict(type_counts),
        'yearly_trends': yearly_trends
    }
