from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load models (with error handling for network issues)
try:
    tokenizer = AutoTokenizer.from_pretrained("microsoft/CodeBERT-base")
    model = AutoModelForSequenceClassification.from_pretrained("microsoft/CodeBERT-base")
except Exception as e:
    print(f"Warning: Could not load CodeBERT model: {e}")
    tokenizer = None
    model = None
import re

# Load CodeBERT model for code quality analysis
model_name = "microsoft/codebert-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)  # Binary classification for good/bad code

def calculate_readability_score(code, language):
    """
    Calculate code readability score based on various metrics.

    Args:
        code (str): Code to analyze
        language (str): Programming language

    Returns:
        dict: Readability metrics
    """
    lines = code.split('\n')
    total_lines = len(lines)

    # Remove empty lines
    non_empty_lines = [line for line in lines if line.strip()]
    non_empty_count = len(non_empty_lines)

    # Calculate average line length
    avg_line_length = sum(len(line) for line in non_empty_lines) / non_empty_count if non_empty_count > 0 else 0

    # Count functions/methods (simple heuristic)
    function_count = 0
    if language.lower() == 'python':
        function_count = len(re.findall(r'def\s+\w+', code))
    elif language.lower() in ['javascript', 'java', 'c++', 'c#']:
        function_count = len(re.findall(r'(function|def|public|private|protected)\s+\w+', code))

    # Count comments
    comment_lines = 0
    if language.lower() == 'python':
        comment_lines = len([line for line in lines if line.strip().startswith('#')])
    elif language.lower() in ['javascript', 'java', 'c++', 'c#']:
        comment_lines = len([line for line in lines if '//' in line or '/*' in line or '*/' in line])

    # Calculate comment ratio
    comment_ratio = comment_lines / total_lines if total_lines > 0 else 0

    # Variable naming score (simple heuristic)
    variable_score = 0
    if language.lower() == 'python':
        variables = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', code)
        meaningful_vars = [v for v in variables if len(v) > 2 and not v.isupper()]
        variable_score = len(meaningful_vars) / len(variables) if variables else 0

    readability_score = 0
    if avg_line_length < 80:
        readability_score += 30
    elif avg_line_length < 120:
        readability_score += 20
    else:
        readability_score += 10

    if comment_ratio > 0.1:
        readability_score += 25
    elif comment_ratio > 0.05:
        readability_score += 15
    else:
        readability_score += 5

    if function_count > 0:
        readability_score += 20
    else:
        readability_score += 10

    if variable_score > 0.7:
        readability_score += 25
    elif variable_score > 0.5:
        readability_score += 15
    else:
        readability_score += 5

    return {
        "total_lines": total_lines,
        "non_empty_lines": non_empty_count,
        "avg_line_length": round(avg_line_length, 2),
        "function_count": function_count,
        "comment_ratio": round(comment_ratio, 3),
        "readability_score": min(100, readability_score)
    }

def analyze_code_quality(code, language):
    """
    Analyze code quality using CodeBERT and heuristics.

    Args:
        code (str): Code to analyze
        language (str): Programming language

    Returns:
        dict: Quality analysis results
    """
    try:
        # Get readability metrics
        readability = calculate_readability_score(code, language)

        # Use CodeBERT for semantic analysis (simplified)
        # In a real implementation, you'd fine-tune CodeBERT for code quality
        # For now, we'll use the readability score as a proxy

        quality_score = readability["readability_score"]

        # Additional checks
        issues = []

        # Check for common issues
        if readability["avg_line_length"] > 120:
            issues.append("Some lines are too long (>120 characters)")
        if readability["comment_ratio"] < 0.05:
            issues.append("Code could use more comments for clarity")
        if readability["function_count"] == 0 and len(code) > 100:
            issues.append("Consider breaking code into functions for better organization")

        # Language-specific checks
        if language.lower() == 'python':
            if 'import' not in code:
                issues.append("Consider adding necessary imports")
        elif language.lower() == 'javascript':
            if 'console.log' in code and 'production' in code.lower():
                issues.append("Remove console.log statements for production")

        # Generate feedback
        if quality_score >= 80:
            feedback = "Excellent code quality! Well-structured and readable."
        elif quality_score >= 60:
            feedback = "Good code quality. Some improvements suggested."
        elif quality_score >= 40:
            feedback = "Fair code quality. Consider the suggestions for improvement."
        else:
            feedback = "Code needs significant improvements. Focus on readability and structure."

        return {
            "overall_score": quality_score,
            "readability": readability,
            "issues": issues,
            "feedback": feedback,
            "suggestions": [
                "Keep lines under 80-100 characters",
                "Add meaningful comments",
                "Use descriptive variable names",
                "Break complex code into smaller functions",
                "Follow language-specific best practices"
            ]
        }

    except Exception as e:
        print(f"Error evaluating code: {e}")
        return {
            "overall_score": 0,
            "readability": {},
            "issues": ["Failed to analyze code"],
            "feedback": "Unable to evaluate code quality",
            "suggestions": []
        }

def evaluate_code(code, language):
    """
    Main function to evaluate code quality.

    Args:
        code (str): Code to evaluate
        language (str): Programming language

    Returns:
        dict: Evaluation results
    """
    return analyze_code_quality(code, language)

if __name__ == '__main__':
    import sys
    import json

    language = sys.argv[1]
    code_to_evaluate = sys.stdin.read()
    evaluation_result = evaluate_code(code_to_evaluate, language)
    print(json.dumps(evaluation_result, indent=4))
