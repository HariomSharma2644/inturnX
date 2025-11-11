import random
import json
from typing import List, Dict, Any
from transformers import pipeline
import openai
import os

class ProgrammingQuestionGenerator:
    def __init__(self):
        # Initialize OpenAI client
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        # Difficulty levels and their characteristics
        self.difficulty_levels = {
            1: {'complexity': 'basic', 'concepts': ['variables', 'operators', 'basic syntax']},
            2: {'complexity': 'basic', 'concepts': ['conditionals', 'loops', 'functions']},
            3: {'complexity': 'intermediate', 'concepts': ['arrays', 'strings', 'basic algorithms']},
            4: {'complexity': 'intermediate', 'concepts': ['data structures', 'recursion', 'sorting']},
            5: {'complexity': 'intermediate', 'concepts': ['searching', 'hashing', 'stacks/queues']},
            6: {'complexity': 'advanced', 'concepts': ['trees', 'graphs', 'dynamic programming']},
            7: {'complexity': 'advanced', 'concepts': ['greedy algorithms', 'backtracking', 'bit manipulation']},
            8: {'complexity': 'expert', 'concepts': ['advanced DP', 'complex algorithms', 'optimization']},
            9: {'complexity': 'expert', 'concepts': ['system design', 'concurrency', 'advanced data structures']},
            10: {'complexity': 'master', 'concepts': ['competitive programming', 'complex optimization']}
        }

        # Question types by level ranges
        self.question_types = {
            'mcq': list(range(1, 31)),  # Levels 1-30
            'output_prediction': list(range(31, 61)),  # Levels 31-60
            'short_code': list(range(61, 86)),  # Levels 61-85
            'full_problem': list(range(86, 101))  # Levels 86-100
        }

    def generate_question(self, language: str, level: int) -> Dict[str, Any]:
        """Generate a programming question for the given language and level."""
        question_type = self._get_question_type(level)

        if question_type == 'mcq':
            return self._generate_mcq_question(language, level)
        elif question_type == 'output_prediction':
            return self._generate_output_prediction_question(language, level)
        elif question_type == 'short_code':
            return self._generate_short_code_question(language, level)
        elif question_type == 'full_problem':
            return self._generate_full_problem_question(language, level)

    def _get_question_type(self, level: int) -> str:
        """Determine question type based on level."""
        for q_type, levels in self.question_types.items():
            if level in levels:
                return q_type
        return 'mcq'  # Default fallback

    def _generate_mcq_question(self, language: str, level: int) -> Dict[str, Any]:
        """Generate a multiple choice question."""
        difficulty = self.difficulty_levels.get(min(level, 10), self.difficulty_levels[1])
        concepts = difficulty['concepts']

        prompt = f"""Generate a multiple choice programming question for {language} at level {level}.

Difficulty: {difficulty['complexity']}
Concepts to cover: {', '.join(concepts)}

Requirements:
- Question should test understanding of {language} programming concepts
- Provide 4 options (A, B, C, D)
- Only one correct answer
- Include a detailed explanation
- Include a code example if relevant

Format your response as JSON:
{{
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Detailed explanation of the correct answer",
    "codeExample": "Optional code example",
    "type": "mcq"
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )

            result = json.loads(response.choices[0].message.content.strip())
            result['id'] = f"{language}_mcq_{level}_{random.randint(1000, 9999)}"
            result['level'] = level
            result['language'] = language
            return result
        except Exception as e:
            print(f"Error generating MCQ: {e}")
            return self._get_fallback_mcq(language, level)

    def _generate_output_prediction_question(self, language: str, level: int) -> Dict[str, Any]:
        """Generate an output prediction question."""
        difficulty = self.difficulty_levels.get(min(level, 10), self.difficulty_levels[1])

        prompt = f"""Generate an output prediction programming question for {language} at level {level}.

Difficulty: {difficulty['complexity']}
Concepts: {', '.join(difficulty['concepts'])}

Requirements:
- Provide a code snippet
- Ask what the output will be
- Include the correct output
- Provide detailed explanation
- Code should be executable and demonstrate the concept

Format as JSON:
{{
    "question": "What will be the output of the following code?",
    "codeExample": "code snippet here",
    "expectedOutput": "the correct output",
    "explanation": "Detailed explanation",
    "type": "output_prediction"
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )

            result = json.loads(response.choices[0].message.content.strip())
            result['id'] = f"{language}_output_{level}_{random.randint(1000, 9999)}"
            result['level'] = level
            result['language'] = language
            return result
        except Exception as e:
            print(f"Error generating output prediction: {e}")
            return self._get_fallback_output_prediction(language, level)

    def _generate_short_code_question(self, language: str, level: int) -> Dict[str, Any]:
        """Generate a short code question."""
        difficulty = self.difficulty_levels.get(min(level, 10), self.difficulty_levels[1])

        prompt = f"""Generate a short coding problem for {language} at level {level}.

Difficulty: {difficulty['complexity']}
Concepts: {', '.join(difficulty['concepts'])}

Requirements:
- Problem should be solvable in 10-20 lines of code
- Include clear problem description
- Provide constraints
- Include sample input/output
- Provide complete solution code
- Solution should demonstrate the required concepts

Format as JSON:
{{
    "question": "Problem description",
    "description": "Detailed problem statement",
    "constraints": ["constraint 1", "constraint 2"],
    "sampleInput": "sample input",
    "sampleOutput": "sample output",
    "codeExample": "complete solution code",
    "explanation": "Explanation of the solution",
    "type": "short_code"
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=1500
            )

            result = json.loads(response.choices[0].message.content.strip())
            result['id'] = f"{language}_short_{level}_{random.randint(1000, 9999)}"
            result['level'] = level
            result['language'] = language
            return result
        except Exception as e:
            print(f"Error generating short code: {e}")
            return self._get_fallback_short_code(language, level)

    def _generate_full_problem_question(self, language: str, level: int) -> Dict[str, Any]:
        """Generate a full problem question."""
        difficulty = self.difficulty_levels.get(min(level, 10), self.difficulty_levels[1])

        prompt = f"""Generate a complete coding problem for {language} at level {level}.

Difficulty: {difficulty['complexity']}
Concepts: {', '.join(difficulty['concepts'])}

Requirements:
- Complex algorithmic problem
- Multiple test cases consideration
- Time/space complexity requirements
- Complete solution with explanation
- Should be challenging for experienced programmers

Format as JSON:
{{
    "question": "Problem title",
    "description": "Detailed problem statement with examples",
    "constraints": ["time limit", "space limit", "input constraints"],
    "sampleInput": "sample input",
    "sampleOutput": "sample output",
    "codeExample": "complete efficient solution",
    "explanation": "Detailed algorithmic explanation",
    "type": "full_problem"
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=2000
            )

            result = json.loads(response.choices[0].message.content.strip())
            result['id'] = f"{language}_full_{level}_{random.randint(1000, 9999)}"
            result['level'] = level
            result['language'] = language
            return result
        except Exception as e:
            print(f"Error generating full problem: {e}")
            return self._get_fallback_full_problem(language, level)

    # Fallback methods for when AI generation fails
    def _get_fallback_mcq(self, language: str, level: int) -> Dict[str, Any]:
        """Fallback MCQ question."""
        questions = {
            'javascript': {
                1: {
                    "question": "What will console.log(typeof null) output in JavaScript?",
                    "options": ["null", "undefined", "object", "boolean"],
                    "answerIndex": 2,
                    "explanation": "'null' is considered an object in JavaScript for historical reasons.",
                    "codeExample": "console.log(typeof null); // outputs: object"
                }
            },
            'python': {
                1: {
                    "question": "What is the output of print(2 ** 3) in Python?",
                    "options": ["6", "8", "9", "16"],
                    "answerIndex": 1,
                    "explanation": "** is the exponentiation operator in Python, so 2^3 = 8.",
                    "codeExample": "print(2 ** 3)  # outputs: 8"
                }
            }
        }

        fallback = questions.get(language, questions['javascript'])[1]
        fallback.update({
            'id': f"{language}_mcq_{level}_fallback",
            'level': level,
            'language': language,
            'type': 'mcq'
        })
        return fallback

    def _get_fallback_output_prediction(self, language: str, level: int) -> Dict[str, Any]:
        """Fallback output prediction question."""
        questions = {
            'javascript': {
                31: {
                    "question": "What will be the output of the following code?",
                    "codeExample": "let x = 5;\nconsole.log(x++);\nconsole.log(x);",
                    "expectedOutput": "5\n6",
                    "explanation": "x++ is post-increment, so it returns 5 first, then increments to 6."
                }
            },
            'python': {
                31: {
                    "question": "What will be the output of the following code?",
                    "codeExample": "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
                    "expectedOutput": "[1, 2, 3, 4]",
                    "explanation": "Lists are mutable and passed by reference, so y and x point to the same list."
                }
            }
        }

        fallback = questions.get(language, questions['javascript'])[31]
        fallback.update({
            'id': f"{language}_output_{level}_fallback",
            'level': level,
            'language': language,
            'type': 'output_prediction'
        })
        return fallback

    def _get_fallback_short_code(self, language: str, level: int) -> Dict[str, Any]:
        """Fallback short code question."""
        questions = {
            'javascript': {
                61: {
                    "question": "Write a function to check if a string is a palindrome",
                    "description": "Write a JavaScript function that takes a string and returns true if it's a palindrome (reads the same forwards and backwards), false otherwise. Ignore case and non-alphanumeric characters.",
                    "constraints": ["Input length: 1-1000 characters", "Case insensitive"],
                    "sampleInput": "'A man, a plan, a canal: Panama'",
                    "sampleOutput": "true",
                    "codeExample": """function isPalindrome(s) {
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return s === s.split('').reverse().join('');
}""",
                    "explanation": "Convert to lowercase, remove non-alphanumeric chars, then compare with its reverse."
                }
            },
            'python': {
                61: {
                    "question": "Write a function to find the maximum subarray sum",
                    "description": "Given an array of integers, find the contiguous subarray with the largest sum and return that sum.",
                    "constraints": ["Array length: 1-10^5", "Elements: -10^4 to 10^4"],
                    "sampleInput": "[-2,1,-3,4,-1,2,1,-5,4]",
                    "sampleOutput": "6",
                    "codeExample": """def maxSubArray(nums):
    max_current = max_global = nums[0]
    for i in range(1, len(nums)):
        max_current = max(nums[i], max_current + nums[i])
        if max_current > max_global:
            max_global = max_current
    return max_global""",
                    "explanation": "Use Kadane's algorithm to find the maximum subarray sum in O(n) time."
                }
            }
        }

        fallback = questions.get(language, questions['javascript'])[61]
        fallback.update({
            'id': f"{language}_short_{level}_fallback",
            'level': level,
            'language': language,
            'type': 'short_code'
        })
        return fallback

    def _get_fallback_full_problem(self, language: str, level: int) -> Dict[str, Any]:
        """Fallback full problem question."""
        questions = {
            'javascript': {
                86: {
                    "question": "Implement a LRU Cache",
                    "description": "Design and implement a data structure for Least Recently Used (LRU) cache. It should support get and put operations. When the cache reaches its capacity, it should invalidate the least recently used item before inserting a new item.",
                    "constraints": ["Capacity: 1-3000", "Operations: up to 3*10^4", "Keys/Values: 1-10^4"],
                    "sampleInput": "LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);",
                    "sampleOutput": "[null,null,1,null,-1]",
                    "codeExample": """class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return -1;
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}""",
                    "explanation": "Use a Map to maintain insertion order. Move accessed items to the end (most recent)."
                }
            },
            'python': {
                86: {
                    "question": "Implement Trie (Prefix Tree)",
                    "description": "Implement a trie (prefix tree) with insert, search, and startsWith methods.",
                    "constraints": ["Operations: up to 3*10^4", "Word length: 1-2000", "All inputs consist of lowercase English letters"],
                    "sampleInput": "Trie(); insert('apple'); search('apple'); startsWith('app');",
                    "sampleOutput": "[null,null,true,true]",
                    "codeExample": """class TrieNode:
    def __init__(self):
        self.children = {}
        self.isEnd = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.isEnd = True

    def search(self, word: str) -> bool:
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.isEnd

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True""",
                    "explanation": "Use a tree structure where each node represents a character. isEnd marks word endings."
                }
            }
        }

        fallback = questions.get(language, questions['javascript'])[86]
        fallback.update({
            'id': f"{language}_full_{level}_fallback",
            'level': level,
            'language': language,
            'type': 'full_problem'
        })
        return fallback

# Global instance
programming_question_generator = ProgrammingQuestionGenerator()
