import openai
import os
from typing import Dict, List, Optional
from datetime import datetime

class InterviewAI:
    def __init__(self):
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.interviewer_personalities = {
            "technical": {
                "name": "Alex Chen",
                "role": "Senior Software Engineer",
                "style": "Direct, technical, focuses on problem-solving and code quality",
                "prompt": "You are Alex Chen, a senior software engineer conducting a technical interview. Ask challenging questions about algorithms, system design, and coding best practices. Be direct and focus on technical accuracy."
            },
            "hr": {
                "name": "Sarah Johnson",
                "role": "HR Manager",
                "style": "Professional, behavioral-focused, emphasizes company culture fit",
                "prompt": "You are Sarah Johnson, an HR manager conducting a behavioral interview. Focus on teamwork, leadership, and company culture fit. Ask situational questions that reveal the candidate's values and work ethic."
            },
            "behavioral": {
                "name": "Michael Rodriguez",
                "role": "Engineering Manager",
                "style": "Leadership-focused, emphasizes growth and collaboration",
                "prompt": "You are Michael Rodriguez, an engineering manager conducting a behavioral interview. Focus on leadership, collaboration, and professional growth. Ask questions that reveal how the candidate handles challenges and works with teams."
            }
        }

    def generate_adaptive_question(self, role: str, previous_answers: List[Dict], personality: str = "technical") -> Dict:
        """Generate an adaptive question based on previous answers and role."""
        personality_config = self.interviewer_personalities.get(personality, self.interviewer_personalities["technical"])

        # Build context from previous answers
        context = ""
        if previous_answers:
            context = "\nPrevious questions and answers:\n"
            for i, answer in enumerate(previous_answers[-3:], 1):  # Last 3 answers for context
                context += f"Q{i}: {answer.get('question', '')}\nA{i}: {answer.get('answer', '')}\n"

        prompt = f"""{personality_config['prompt']}

Role being interviewed for: {role}
{context}

Generate the next interview question that:
1. Is appropriate for the {role} position
2. Builds on previous answers if any
3. Tests relevant skills and experience
4. Is open-ended enough to allow detailed responses

Return only the question text, nothing else."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )
            question = response.choices[0].message.content.strip()

            return {
                "question": question,
                "personality": personality,
                "interviewer_name": personality_config["name"],
                "interviewer_role": personality_config["role"],
                "generated_at": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error generating question: {e}")
            return self._get_fallback_question(role, personality)

    def analyze_answer_quality(self, question: str, answer: str, role: str) -> Dict:
        """Analyze the quality of an interview answer using AI."""
        prompt = f"""Analyze this interview answer for a {role} position:

Question: {question}
Answer: {answer}

Provide analysis in JSON format with these metrics (0-100 scale):
{{
    "clarity": "How clear and well-structured is the answer?",
    "confidence": "How confident does the candidate seem?",
    "technicalAccuracy": "How technically accurate is the answer?",
    "communication": "How well does the candidate communicate complex ideas?",
    "completeness": "How complete is the answer?",
    "relevance": "How relevant is the answer to the question?"
}}

Also include:
- "strengths": array of specific strengths
- "weaknesses": array of specific areas for improvement
- "suggestions": array of actionable improvement suggestions

Return only valid JSON."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )

            import json
            analysis = json.loads(response.choices[0].message.content.strip())

            return analysis
        except Exception as e:
            print(f"Error analyzing answer: {e}")
            return self._get_fallback_analysis(answer)

    def generate_followup_question(self, question: str, answer: str, role: str, personality: str = "technical") -> str:
        """Generate a follow-up question based on the answer."""
        personality_config = self.interviewer_personalities.get(personality, self.interviewer_personalities["technical"])

        prompt = f"""{personality_config['prompt']}

Original Question: {question}
Candidate's Answer: {answer}

Generate a follow-up question that:
1. Probes deeper into the topic
2. Tests understanding of related concepts
3. Reveals more about the candidate's experience
4. Is appropriate for a {role} position

Return only the follow-up question text."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return "Can you elaborate on that point?"

    def _get_fallback_question(self, role: str, personality: str) -> Dict:
        """Fallback question when AI generation fails."""
        fallback_questions = {
            "software engineer": "Explain your approach to debugging a complex issue in a production environment.",
            "web developer": "How do you ensure your web applications are accessible to users with disabilities?",
            "data analyst": "How do you approach cleaning and preparing data for analysis?",
            "full stack developer": "How do you handle state management in a large-scale application?",
            "data scientist": "How do you validate the performance of a machine learning model?",
            "product manager": "How do you prioritize features when resources are limited?"
        }

        question = fallback_questions.get(role.lower(), "Tell me about a challenging project you worked on and how you overcame obstacles.")

        personality_config = self.interviewer_personalities.get(personality, self.interviewer_personalities["technical"])

        return {
            "question": question,
            "personality": personality,
            "interviewer_name": personality_config["name"],
            "interviewer_role": personality_config["role"],
            "generated_at": datetime.now().isoformat()
        }

    def _get_fallback_analysis(self, answer: str) -> Dict:
        """Fallback analysis when AI analysis fails."""
        word_count = len(answer.split())
        return {
            "clarity": min(100, word_count * 2),
            "confidence": 70,
            "technicalAccuracy": 75,
            "communication": min(100, word_count * 1.5),
            "completeness": min(100, word_count * 2.5),
            "relevance": 80,
            "strengths": ["Attempted to answer the question", "Provided some detail"],
            "weaknesses": ["Could be more specific", "Consider adding examples"],
            "suggestions": ["Include specific examples", "Structure answers more clearly", "Practice explaining technical concepts"]
        }

# Global instance
interview_ai = InterviewAI()
