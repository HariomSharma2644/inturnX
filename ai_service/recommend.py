from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load the model (this will download on first run)
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Sample course data (in production, this would come from database)
SAMPLE_COURSES = [
    {
        "id": "1",
        "title": "Introduction to Python Programming",
        "description": "Learn the basics of Python programming including variables, loops, functions, and data structures.",
        "skills": ["python", "programming", "basics"],
        "difficulty": "beginner"
    },
    {
        "id": "2",
        "title": "Web Development with React",
        "description": "Build modern web applications using React, JavaScript, and modern frontend tools.",
        "skills": ["javascript", "react", "frontend", "web development"],
        "difficulty": "intermediate"
    },
    {
        "id": "3",
        "title": "Machine Learning Fundamentals",
        "description": "Introduction to machine learning concepts, algorithms, and practical applications.",
        "skills": ["python", "machine learning", "data science", "algorithms"],
        "difficulty": "intermediate"
    },
    {
        "id": "4",
        "title": "Advanced Data Structures and Algorithms",
        "description": "Deep dive into complex data structures and algorithmic problem solving.",
        "skills": ["algorithms", "data structures", "problem solving", "computer science"],
        "difficulty": "advanced"
    },
    {
        "id": "5",
        "title": "Database Design and SQL",
        "description": "Learn to design databases, write efficient SQL queries, and understand database management.",
        "skills": ["sql", "database", "data modeling", "backend"],
        "difficulty": "beginner"
    }
]

def recommend_courses(user_skills, completed_course_ids):
    """
    Recommend courses based on user's skills and completed courses.

    Args:
        user_skills (list): List of user's skills
        completed_course_ids (list): List of completed course IDs

    Returns:
        list: Recommended courses with scores
    """
    try:
        # Filter out completed courses
        available_courses = [course for course in SAMPLE_COURSES
                           if course["id"] not in completed_course_ids]

        if not available_courses:
            return []

        # Create embeddings for user skills
        user_skills_text = " ".join(user_skills)
        user_embedding = model.encode([user_skills_text])[0]

        recommendations = []

        for course in available_courses:
            # Create course embedding from description and skills
            course_text = f"{course['description']} {' '.join(course['skills'])}"
            course_embedding = model.encode([course_text])[0]

            # Calculate similarity
            similarity = cosine_similarity([user_embedding], [course_embedding])[0][0]

            # Boost score for courses that match user skill level
            skill_match_boost = 0
            course_skills = set(course['skills'])
            user_skills_set = set(user_skills)

            if course_skills.intersection(user_skills_set):
                skill_match_boost = 0.2

            final_score = similarity + skill_match_boost

            recommendations.append({
                "course": course,
                "score": float(final_score),
                "reason": f"Matches your {'skills' if skill_match_boost > 0 else 'interests'}"
            })

        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:5]

    except Exception as e:
        print(f"Error in course recommendation: {e}")
        return []
