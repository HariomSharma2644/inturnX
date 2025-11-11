import re

# Common technical skills to look for
TECHNICAL_SKILLS = {
    "programming_languages": ["python", "javascript", "java", "c++", "c#", "ruby", "php", "go", "rust", "typescript", "kotlin", "swift"],
    "frameworks": ["react", "angular", "vue", "django", "flask", "spring", "express", "laravel", "rails"],
    "databases": ["mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "sql server"],
    "tools": ["git", "docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "travis", "github", "gitlab"],
    "soft_skills": ["leadership", "communication", "teamwork", "problem solving", "analytical", "creative"]
}

def extract_skills(text):
    """
    Extract technical skills from resume text.

    Args:
        text (str): Resume text content

    Returns:
        dict: Extracted skills categorized by type
    """
    text_lower = text.lower()
    extracted_skills = {
        "programming_languages": [],
        "frameworks": [],
        "databases": [],
        "tools": [],
        "soft_skills": [],
        "other": []
    }

    # Extract skills using keyword matching
    for category, skills in TECHNICAL_SKILLS.items():
        for skill in skills:
            if skill in text_lower:
                extracted_skills[category].append(skill.title())

    # Simple organization extraction using regex patterns
    organizations = []
    org_patterns = [
        r'(?:at|with|for)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited)?)',
        r'([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited))'
    ]

    for pattern in org_patterns:
        matches = re.findall(pattern, text)
        organizations.extend(matches)

    organizations = list(set(organizations))[:5]  # Limit to 5 organizations

    # Extract years of experience (simple regex)
    experience_years = []
    experience_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience\s*(?:of\s*)?(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*(?:in\s*)?'
    ]

    for pattern in experience_patterns:
        matches = re.findall(pattern, text_lower)
        experience_years.extend([int(match) for match in matches])

    total_experience = max(experience_years) if experience_years else 0

    return {
        "skills": extracted_skills,
        "organizations": list(set(organizations)),
        "experience_years": total_experience,
        "skill_count": sum(len(skills) for skills in extracted_skills.values())
    }

def analyze_resume(resume_text):
    """
    Analyze resume and provide insights for internship matching.

    Args:
        resume_text (str): Full resume text

    Returns:
        dict: Analysis results including skills, experience, and recommendations
    """
    try:
        # Extract skills and experience
        skill_analysis = extract_skills(resume_text)

        # Generate recommendations based on skills
        recommendations = []

        if skill_analysis["experience_years"] < 1:
            recommendations.append("Consider entry-level internships or internships with training programs")
        elif skill_analysis["experience_years"] < 3:
            recommendations.append("Look for junior developer or associate positions")
        else:
            recommendations.append("Consider mid-level positions or roles matching your experience")

        # Skill-based recommendations
        total_skills = skill_analysis["skill_count"]
        if total_skills < 3:
            recommendations.append("Focus on building more technical skills through courses")
        elif total_skills < 6:
            recommendations.append("Good foundation - consider specializing in one technology stack")
        else:
            recommendations.append("Strong skill set - highlight projects and achievements")

        # Suggest internship types based on skills
        internship_suggestions = []
        if skill_analysis["skills"]["programming_languages"]:
            internship_suggestions.append("Software Development Internships")
        if skill_analysis["skills"]["frameworks"]:
            internship_suggestions.append("Full-Stack Development Internships")
        if skill_analysis["skills"]["databases"]:
            internship_suggestions.append("Backend Development Internships")
        if skill_analysis["skills"]["tools"]:
            internship_suggestions.append("DevOps/Cloud Internships")

        return {
            "skills_extracted": skill_analysis["skills"],
            "experience_years": skill_analysis["experience_years"],
            "organizations": skill_analysis["organizations"],
            "recommendations": recommendations,
            "suggested_internships": internship_suggestions,
            "overall_score": min(100, total_skills * 10 + skill_analysis["experience_years"] * 5)
        }

    except Exception as e:
        print(f"Error analyzing resume: {e}")
        return {
            "error": "Failed to analyze resume",
            "skills_extracted": {},
            "experience_years": 0,
            "recommendations": ["Unable to analyze resume - please try again"],
            "overall_score": 0
        }
