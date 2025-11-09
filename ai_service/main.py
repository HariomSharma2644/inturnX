from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from recommend import recommend_courses
from resume_analyzer import analyze_resume
from code_eval import evaluate_code
from chat_mentor import chat_with_mentor
from transcribe_audio import transcriber
from generate_report import generate_interview_report
import io

app = FastAPI(title="InturnX AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    user_skills: list[str]
    completed_courses: list[str]

class ResumeAnalysisRequest(BaseModel):
    resume: str

class CodeEvaluationRequest(BaseModel):
    code: str
    language: str

class ChatRequest(BaseModel):
    message: str
    context: dict = {}

class AudioTranscriptionRequest(BaseModel):
    audio_data: bytes

class InterviewAnalysisRequest(BaseModel):
    transcript: str
    visual_cues: dict

class ReportGenerationRequest(BaseModel):
    report_data: dict

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "InturnX AI"}

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = recommend_courses(request.user_skills, request.completed_courses)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-resume")
async def analyze_resume_endpoint(request: ResumeAnalysisRequest):
    try:
        analysis = analyze_resume(request.resume)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-code")
async def evaluate_code_endpoint(request: CodeEvaluationRequest):
    try:
        evaluation = evaluate_code(request.code, request.language)
        return {"evaluation": evaluation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat-mentor")
async def chat_mentor_endpoint(request: ChatRequest):
    try:
        response = chat_with_mentor(request.message, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe-audio")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    try:
        # Read audio file
        audio_data = await file.read()

        # Transcribe using Whisper
        transcript = transcriber.transcribe_audio(audio_data)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-interview")
async def analyze_interview_endpoint(request: InterviewAnalysisRequest):
    try:
        # Analyze interview based on transcript and visual cues
        transcript = request.transcript
        visual_cues = request.visual_cues

        # Mock AI analysis (in real implementation, use LLM)
        analysis = {
            "clarity": min(100, max(0, len(transcript.split()) * 2)),
            "confidence": visual_cues.get("eyeContact", 50),
            "technicalAccuracy": 75,  # Mock value
            "communication": 80,  # Mock value
            "eyeContactScore": visual_cues.get("eyeContact", 0),
            "facialExpressions": visual_cues.get("facialExpressions", []),
            "bodyPosture": visual_cues.get("bodyPosture", "unknown"),
            "feedback": {
                "strengths": [
                    "Clear communication" if len(transcript) > 50 else "Attempted to answer",
                    "Maintained some eye contact" if visual_cues.get("eyeContact", 0) > 30 else "Made effort to engage"
                ],
                "weaknesses": [
                    "Could improve eye contact" if visual_cues.get("eyeContact", 0) < 70 else "",
                    "Consider more structured answers" if len(transcript.split()) < 20 else ""
                ]
            }
        }

        # Filter out empty weaknesses
        analysis["feedback"]["weaknesses"] = [w for w in analysis["feedback"]["weaknesses"] if w]

        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
async def generate_report_endpoint(request: ReportGenerationRequest):
    try:
        pdf_bytes = generate_interview_report(request.report_data)
        return {"pdf": pdf_bytes.decode('latin-1')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
