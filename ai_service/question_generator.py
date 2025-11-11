import random
from typing import List, Dict
from datasets import load_dataset
from transformers import pipeline

class QuestionGenerator:
    def __init__(self):
        # Load interview question datasets
        try:
            # Try to load from Hugging Face datasets
            self.behavioral_dataset = load_dataset("jacob-hugging-face/job-interview-dataset", split="train")
            self.technical_dataset = load_dataset("jacob-hugging-face/job-interview-dataset", split="train")
        except Exception as e:
            print(f"Could not load Hugging Face datasets: {e}")
            # Fallback to predefined questions
            self.behavioral_dataset = None
            self.technical_dataset = None

        # Initialize sentiment analysis for question relevance
        try:
            self.sentiment_analyzer = pipeline("sentiment-analysis")
        except Exception as e:
            print(f"Could not load sentiment analyzer: {e}")
            self.sentiment_analyzer = None

    def get_questions_for_role(self, role: str, num_questions: int = 8) -> List[str]:
        """Generate interview questions based on the candidate's role."""
        role = role.lower().strip()

        # Role-specific question banks
        question_banks = {
            'software engineer': [
                'Tell me about yourself and your background in software development.',
                'Explain the difference between object-oriented and functional programming.',
                'How do you approach debugging a complex issue?',
                'Describe a challenging project you worked on and how you overcame obstacles.',
                'What are your thoughts on testing? How do you ensure code quality?',
                'Explain how you would design a scalable web application.',
                'Tell me about a time you had to learn a new technology quickly.',
                'How do you handle code reviews and feedback?',
                'Describe your experience with version control systems like Git.',
                'How do you approach performance optimization in your applications?'
            ],
            'web developer': [
                'Walk me through your process for building a responsive web application.',
                'Explain the difference between HTML, CSS, and JavaScript.',
                'How do you optimize website performance?',
                'Describe your experience with frontend frameworks like React or Angular.',
                'How do you handle browser compatibility issues?',
                'Explain your approach to state management in a web application.',
                'Tell me about a challenging UI/UX problem you solved.',
                'How do you ensure accessibility in your web applications?',
                'Describe your experience with CSS preprocessors like Sass or Less.',
                'How do you handle cross-browser testing and debugging?'
            ],
            'data analyst': [
                'Tell me about your experience with data analysis and visualization.',
                'Explain your process for cleaning and preparing data for analysis.',
                'What tools and programming languages do you use for data analysis?',
                'Describe a challenging data problem you solved.',
                'How do you ensure data accuracy and integrity?',
                'Explain your approach to presenting data insights to stakeholders.',
                'Tell me about a time you had to work with incomplete or messy data.',
                'How do you stay updated with the latest data analytics trends?',
                'Describe your experience with statistical analysis and modeling.',
                'How do you handle large datasets and performance considerations?'
            ],
            'full stack developer': [
                'Describe your experience with both frontend and backend development.',
                'How do you approach database design and optimization?',
                'Explain your process for deploying and maintaining web applications.',
                'Tell me about a full-stack project you built from scratch.',
                'How do you handle API design and integration?',
                'Describe your experience with version control and collaboration.',
                'How do you ensure security in your applications?',
                'Tell me about your approach to testing full-stack applications.',
                'Explain your experience with cloud platforms and deployment.',
                'How do you handle state management across frontend and backend?'
            ],
            'data scientist': [
                'Explain your experience with machine learning and predictive modeling.',
                'How do you approach feature engineering and selection?',
                'Describe your process for model validation and evaluation.',
                'Tell me about a challenging data science problem you solved.',
                'How do you handle imbalanced datasets?',
                'Explain your experience with deep learning frameworks.',
                'How do you communicate complex technical findings to non-technical stakeholders?',
                'Describe your approach to A/B testing and experimental design.',
                'How do you stay current with advances in data science and AI?',
                'Tell me about your experience with big data technologies.'
            ],
            'product manager': [
                'Describe your product development process from ideation to launch.',
                'How do you prioritize features and manage a product roadmap?',
                'Tell me about a time you had to say no to a feature request.',
                'How do you gather and incorporate user feedback into product decisions?',
                'Explain your approach to defining and measuring product success metrics.',
                'Describe a situation where you had to pivot or change direction on a product.',
                'How do you work with engineering teams to ensure product requirements are met?',
                'Tell me about your experience with market research and competitive analysis.',
                'How do you handle stakeholder management and conflicting priorities?',
                'Describe your approach to product pricing and monetization strategies.'
            ]
        }

        # Get questions from the appropriate bank
        if role in question_banks:
            questions = question_banks[role].copy()
        else:
            # Default to software engineer questions for unknown roles
            questions = question_banks['software engineer'].copy()

        # Try to supplement with dataset questions if available
        if self.behavioral_dataset is not None:
            try:
                dataset_questions = self._get_dataset_questions(role, num_questions // 2)
                questions.extend(dataset_questions)
            except Exception as e:
                print(f"Error getting dataset questions: {e}")

        # Shuffle and select the requested number of questions
        random.shuffle(questions)
        return questions[:num_questions]

    def _get_dataset_questions(self, role: str, num_questions: int) -> List[str]:
        """Extract relevant questions from Hugging Face datasets."""
        questions = []

        # Filter dataset by role/category if possible
        role_keywords = {
            'software engineer': ['software', 'developer', 'programming', 'code', 'technical'],
            'web developer': ['web', 'frontend', 'javascript', 'html', 'css', 'ui', 'ux'],
            'data analyst': ['data', 'analysis', 'analytics', 'sql', 'visualization'],
            'full stack developer': ['full stack', 'backend', 'frontend', 'database', 'api'],
            'data scientist': ['machine learning', 'ai', 'data science', 'modeling', 'statistics'],
            'product manager': ['product', 'roadmap', 'stakeholder', 'user', 'market']
        }

        keywords = role_keywords.get(role, ['technical', 'behavioral'])

        # Sample from dataset
        if self.behavioral_dataset:
            for item in self.behavioral_dataset:
                if len(questions) >= num_questions:
                    break

                question_text = item.get('question', '').lower()
                if any(keyword in question_text for keyword in keywords):
                    questions.append(item.get('question', ''))

        return questions[:num_questions]

    def analyze_question_quality(self, question: str) -> Dict:
        """Analyze the quality of a generated question."""
        analysis = {
            'length': len(question.split()),
            'has_action_verb': any(word in question.lower() for word in ['explain', 'describe', 'tell', 'how', 'what', 'why']),
            'is_behavioral': any(word in question.lower() for word in ['time', 'experience', 'situation', 'challenge']),
            'is_technical': any(word in question.lower() for word in ['code', 'algorithm', 'database', 'api', 'framework'])
        }

        # Sentiment analysis if available
        if self.sentiment_analyzer:
            try:
                sentiment = self.sentiment_analyzer(question)[0]
                analysis['sentiment'] = sentiment['label']
                analysis['sentiment_score'] = sentiment['score']
            except Exception as e:
                print(f"Error analyzing sentiment: {e}")

        return analysis

# Global question generator instance
question_generator = QuestionGenerator()
