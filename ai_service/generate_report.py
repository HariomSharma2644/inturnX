from datetime import datetime
import json

def generate_interview_report(report_data):
    """Generate JSON report from interview data as specified in requirements."""

    # Calculate overall rating (out of 10)
    transcript = report_data.get('transcript', [])
    if transcript:
        avg_score = sum([
            item['evaluation']['clarity'] +
            item['evaluation']['confidence'] +
            item['evaluation']['technicalAccuracy'] +
            item['evaluation']['communication']
            for item in transcript
        ]) / (len(transcript) * 4) / 10  # Convert to 0-10 scale
        overall_rating = round(avg_score, 1)
    else:
        overall_rating = 0.0

    # Build the structured JSON report matching the exact specification
    report = {
        "interview_summary": {
            "candidate_role": report_data.get('user_role', 'Not specified'),
            "total_questions": len(transcript),
            "duration": report_data.get('duration', 'N/A'),
            "overall_rating": overall_rating
        },
        "questions": [
            {
                "question": item['question'],
                "answer_summary": item.get('transcript', item.get('answer', 'No answer provided'))[:200] + ('...' if len(item.get('transcript', item.get('answer', ''))) > 200 else ''),
                "feedback": f"Clarity: {item['evaluation']['clarity']}%, Confidence: {item['evaluation']['confidence']}%, Technical: {item['evaluation']['technicalAccuracy']}%, Communication: {item['evaluation']['communication']}%",
                "score": round((item['evaluation']['clarity'] + item['evaluation']['confidence'] + item['evaluation']['technicalAccuracy'] + item['evaluation']['communication']) / 4)
            }
            for item in transcript
        ],
        "body_language": {
            "eye_contact": f"{report_data.get('visualAnalytics', {}).get('avg_eye_contact', 50)}%",
            "gesture_usage": "Moderate" if report_data.get('visualAnalytics', {}).get('avg_gesture_frequency', 0) > 2 else "Low",
            "facial_expression": report_data.get('visualAnalytics', {}).get('dominant_expression', 'neutral').capitalize()
        },
        "communication_analysis": {
            "clarity": "High" if overall_rating >= 7 else "Medium" if overall_rating >= 5 else "Low",
            "tone": "Professional",
            "confidence": "High" if overall_rating >= 7 else "Medium" if overall_rating >= 5 else "Low",
            "pacing": "Appropriate"
        },
        "recommendations": report_data.get('recommendations', [
            "Practice maintaining consistent eye contact",
            "Work on providing more detailed technical explanations",
            "Focus on clear and confident communication",
            "Consider structuring answers with specific examples"
        ])
    }

    return json.dumps(report, indent=2)
