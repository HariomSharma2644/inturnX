# Simplified chat mentor without heavy ML models due to disk space constraints
chat_pipeline = None
print("Chat mentor initialized with fallback responses")

def generate_mentor_response(message, context=None):
    """
    Generate a helpful response as an AI mentor using predefined responses.
    """
    # Predefined responses for common programming topics
    responses = {
        "hello": "Hello! I'm your AI coding mentor. What would you like to learn about today? Whether it's programming basics, debugging, or career advice, I'm here to help!",
        "help": "I can help you with programming concepts, debugging code, learning resources, project ideas, and career development in tech. What specific topic interests you?",
        "javascript": "JavaScript is a versatile programming language used for web development. It can run in browsers and servers (with Node.js). Key concepts include variables, functions, objects, and asynchronous programming. What aspect would you like to explore?",
        "python": "Python is excellent for beginners and professionals alike! It's readable, has a vast ecosystem, and is used in web development, data science, AI, and automation. The syntax emphasizes readability. What Python topic interests you?",
        "react": "React is a popular JavaScript library for building user interfaces. It uses components, state management, and virtual DOM for efficient rendering. Key concepts include JSX, props, state, and hooks. What React feature would you like to learn?",
        "debug": "Debugging is a crucial skill! Start by reproducing the issue, then use console.log() or breakpoints. Check for syntax errors, undefined variables, and logic problems. Tools like browser dev tools and VS Code debugger are invaluable. What are you trying to debug?",
        "career": "Tech careers offer great opportunities! Focus on fundamentals (data structures, algorithms), build projects, contribute to open source, and network. Languages like JavaScript, Python, and Java are in high demand. Consider full-stack development, data science, or DevOps. What career path interests you?",
        "project": "Great idea to build projects! Start small and build up. Ideas: todo app, weather dashboard, blog platform, or e-commerce site. Focus on clean code, version control (Git), and deployment. What type of project interests you?",
        "interview": "Technical interviews test problem-solving and fundamentals. Practice LeetCode problems, system design questions, and behavioral interviews. Study data structures (arrays, trees, graphs), algorithms (sorting, searching), and Big O notation. Mock interviews help a lot!",
        "default": "That's an interesting question! While I'm still learning, I recommend checking out resources like MDN Web Docs, freeCodeCamp, or official documentation. You can also ask more specific questions about programming concepts, debugging, or career advice. What else would you like to know?"
    }

    # Simple keyword matching
    message_lower = message.lower().strip()

    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return responses["hello"]
    elif "help" in message_lower or "what can you do" in message_lower:
        return responses["help"]
    elif "javascript" in message_lower or "js" in message_lower:
        return responses["javascript"]
    elif "python" in message_lower:
        return responses["python"]
    elif "react" in message_lower:
        return responses["react"]
    elif any(word in message_lower for word in ["debug", "bug", "error", "fix"]):
        return responses["debug"]
    elif any(word in message_lower for word in ["career", "job", "work"]):
        return responses["career"]
    elif any(word in message_lower for word in ["project", "build", "create"]):
        return responses["project"]
    elif any(word in message_lower for word in ["interview", "prep"]):
        return responses["interview"]
    else:
        return responses["default"]

def chat_with_mentor(message, context=None):
    """
    Main function for AI mentor chat.

    Args:
        message (str): User's message
        context (dict): Context information

    Returns:
        str: Mentor response
    """
    if not message or not message.strip():
        return "Hello! I'm your AI coding mentor. What would you like to learn or discuss today?"

    return generate_mentor_response(message.strip(), context)
