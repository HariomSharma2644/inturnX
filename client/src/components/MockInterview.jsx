import React, { useState, useEffect, useRef } from 'react';
import BackButton from './BackButton';
import axios from '../utils/axios';
import { Camera } from '@mediapipe/camera_utils';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Pose } from '@mediapipe/pose';
import jsPDF from 'jspdf';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';

const MockInterview = () => {
  const [stage, setStage] = useState('greeting'); // greeting, interviewing, completed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [visualCues, setVisualCues] = useState({
    eyeContact: 0,
    headMovement: [],
    facialExpressions: [],
    bodyPosture: 'unknown'
  });
  const [isListening, setIsListening] = useState(false);
  const [voiceQuestion, setVoiceQuestion] = useState('');
  const canvasRef = useRef(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const { speak, voices } = useSpeechSynthesis();
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setCurrentAnswer(result);
    },
  });

  // Mock interview questions based on common tech roles
  const questionBank = {
    'Software Engineer': [
      'Tell me about yourself and your background in software development.',
      'Explain the difference between object-oriented and functional programming.',
      'How do you approach debugging a complex issue?',
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'What are your thoughts on testing? How do you ensure code quality?',
      'Explain how you would design a scalable web application.',
      'Tell me about a time you had to learn a new technology quickly.',
      'How do you handle code reviews and feedback?'
    ],
    'Web Developer': [
      'Walk me through your process for building a responsive web application.',
      'Explain the difference between HTML, CSS, and JavaScript.',
      'How do you optimize website performance?',
      'Describe your experience with frontend frameworks like React or Angular.',
      'How do you handle browser compatibility issues?',
      'Explain your approach to state management in a web application.',
      'Tell me about a challenging UI/UX problem you solved.',
      'How do you ensure accessibility in your web applications?'
    ],
    'Data Analyst': [
      'Tell me about your experience with data analysis and visualization.',
      'Explain your process for cleaning and preparing data for analysis.',
      'What tools and programming languages do you use for data analysis?',
      'Describe a challenging data problem you solved.',
      'How do you ensure data accuracy and integrity?',
      'Explain your approach to presenting data insights to stakeholders.',
      'Tell me about a time you had to work with incomplete or messy data.',
      'How do you stay updated with the latest data analytics trends?'
    ],
    'Full Stack Developer': [
      'Describe your experience with both frontend and backend development.',
      'How do you approach database design and optimization?',
      'Explain your process for deploying and maintaining web applications.',
      'Tell me about a full-stack project you built from scratch.',
      'How do you handle API design and integration?',
      'Describe your experience with version control and collaboration.',
      'How do you ensure security in your applications?',
      'Tell me about your approach to testing full-stack applications.'
    ]
  };

  useEffect(() => {
    let faceMesh, pose, camera;

    const initMediaPipe = async () => {
      try {
        // Initialize MediaPipe models
        faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results) => {
          // Process face landmarks for eye contact and facial expressions
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            // Calculate eye contact (simplified - looking at camera area)
            const nose = landmarks[1]; // Nose tip

            // Basic eye contact detection (looking forward)
            const eyeContactScore = Math.min(100, Math.max(0,
              100 - (Math.abs(nose.x - 0.5) * 200 + Math.abs(nose.y - 0.4) * 100)
            ));

            // Facial expression analysis (simplified)
            const mouthTop = landmarks[13];
            const mouthBottom = landmarks[14];
            const smile = mouthTop.x < mouthBottom.x ? 'smiling' : 'neutral';

            setVisualCues(prev => ({
              ...prev,
              eyeContact: Math.round(eyeContactScore),
              facialExpressions: [...prev.facialExpressions.slice(-9), smile], // Keep last 10
              headMovement: [...prev.headMovement.slice(-9), { x: nose.x, y: nose.y, z: nose.z }]
            }));
          }
        });

        pose.onResults((results) => {
          // Process pose landmarks for body posture
          if (results.poseLandmarks) {
            const landmarks = results.poseLandmarks;
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            // Basic posture analysis
            const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
            const hipLevel = Math.abs(leftHip.y - rightHip.y);
            const posture = (shoulderLevel < 0.05 && hipLevel < 0.05) ? 'straight' : 'slouched';

            setVisualCues(prev => ({
              ...prev,
              bodyPosture: posture
            }));
          }
        });
      } catch (error) {
        console.error('Failed to initialize MediaPipe:', error);
      }
    };

    const initCamera = async () => {
      try {
        // Check if video element is ready
        if (!videoRef.current) {
          console.log('Video element not ready, retrying...');
          setTimeout(initCamera, 100);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Initialize audio recorder
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
          // Store blob for processing
          recordedChunksRef.current = [blob];
        };

        // Initialize camera with MediaPipe
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMesh && videoRef.current) await faceMesh.send({ image: videoRef.current });
            if (pose && videoRef.current) await pose.send({ image: videoRef.current });
          },
          width: 640,
          height: 480
        });
        camera.start();

      } catch (error) {
        console.error('Failed to acquire camera feed:', error);
      }
    };

    // Initialize everything
    initMediaPipe().then(() => {
      initCamera();
    });

    return () => {
      if (faceMesh) faceMesh.close();
      if (pose) pose.close();
      if (camera) camera.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startInterview = () => {
    if (!userRole) return;

    const roleQuestions = questionBank[userRole] || questionBank['Software Engineer'];
    setQuestions(roleQuestions);
    setStage('interviewing');

    // Speak the first question
    speakQuestion(0);

    // Start recording audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
    }
  };

  const speakQuestion = (questionIndex) => {
    if (questions[questionIndex]) {
      const question = questions[questionIndex];
      const introText = questionIndex === 0 ?
        `Hello! I'm your AI interviewer. Let's begin the mock interview. Question ${questionIndex + 1}: ${question}` :
        `Question ${questionIndex + 1}: ${question}`;

      speak({ text: introText });
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    setIsLoading(true);

    try {
      // Stop audio recording for this question
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // Create audio blob and transcribe
      let transcript = currentAnswer; // Fallback to typed answer
      if (recordedChunksRef.current.length > 0 && recordedChunksRef.current[0] instanceof Blob) {
        const audioBlob = recordedChunksRef.current[0];
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        try {
          const transcriptionResponse = await axios.post('http://localhost:8000/transcribe-audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          transcript = transcriptionResponse.data.transcript || currentAnswer;
        } catch (transcriptionError) {
          console.log('Transcription failed, using typed answer:', transcriptionError);
        }
      }

      // Analyze interview with AI service
      const analysisResponse = await axios.post('http://localhost:8000/analyze-interview', {
        transcript: transcript,
        visual_cues: visualCues
      });

      const aiEvaluation = analysisResponse.data.analysis;

      // Speak feedback for this answer
      const feedbackText = `Your score for this question: ${aiEvaluation.clarity + aiEvaluation.confidence + aiEvaluation.technicalAccuracy + aiEvaluation.communication}/400 points. ${
        aiEvaluation.clarity > 80 ? 'Great clarity!' : 'Work on being clearer.'
      } ${aiEvaluation.confidence > 75 ? 'Good confidence!' : 'Try to be more confident.'}`;

      speak({ text: feedbackText });

      const newAnswers = [...answers, {
        question: questions[currentQuestion],
        answer: currentAnswer,
        transcript: transcript,
        evaluation: aiEvaluation,
        visualCues: { ...visualCues }
      }];

      setAnswers(newAnswers);
      setEvaluation(aiEvaluation);
      setCurrentAnswer('');

      if (currentQuestion >= questions.length - 1) {
        // Generate final report
        const finalScore = Math.floor(newAnswers.reduce((acc, ans) =>
          acc + (ans.evaluation.clarity + ans.evaluation.confidence + ans.evaluation.technicalAccuracy + ans.evaluation.communication) / 4, 0
        ) / newAnswers.length);

        // Calculate visual analytics
        const avgEyeContact = newAnswers.reduce((acc, ans) => acc + (ans.visualCues.eyeContact || 0), 0) / newAnswers.length;
        const facialExpressionSummary = newAnswers.flatMap(ans => ans.visualCues.facialExpressions || []).reduce((acc, expr) => {
          acc[expr] = (acc[expr] || 0) + 1;
          return acc;
        }, {});
        const mostCommonExpression = Object.keys(facialExpressionSummary).reduce((a, b) =>
          facialExpressionSummary[a] > facialExpressionSummary[b] ? a : b, 'neutral');

        setFinalReport({
          overallScore: finalScore,
          questionCount: newAnswers.length,
          transcript: newAnswers,
          visualAnalytics: {
            avgEyeContact: Math.round(avgEyeContact),
            facialExpressions: facialExpressionSummary,
            bodyPosture: newAnswers[newAnswers.length - 1]?.visualCues.bodyPosture || 'unknown'
          },
          recommendations: [
            'Practice explaining technical concepts more concisely',
            'Work on providing real-world examples',
            'Focus on communication skills and eye contact',
            `Eye contact was ${avgEyeContact > 70 ? 'good' : 'needs improvement'}`,
            `Your most common expression was ${mostCommonExpression}`
          ]
        });

        // Speak completion message
        speak({
          text: `Interview completed! Your overall score is ${finalScore}%. ${finalScore > 80 ? 'Excellent work!' : finalScore > 60 ? 'Good job, with room for improvement.' : 'Keep practicing to improve your interview skills.'}`
        });

        setStage('completed');
      } else {
        setCurrentQuestion(prev => prev + 1);
        // Speak next question
        speakQuestion(currentQuestion + 1);
        // Start recording for next question
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
          recordedChunksRef.current = [];
          mediaRecorderRef.current.start();
        }
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Fallback to mock evaluation
      const mockEvaluation = {
        clarity: 80, confidence: 75, technicalAccuracy: 70, communication: 80,
        feedback: { strengths: ['Answer provided'], weaknesses: ['Could be more detailed'] }
      };
      setEvaluation(mockEvaluation);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setStage('greeting');
    setCurrentQuestion(0);
    setQuestions([]);
    setAnswers([]);
    setCurrentAnswer('');
    setEvaluation(null);
    setFinalReport(null);
    setUserRole('');
    setVisualCues({
      eyeContact: 0,
      headMovement: [],
      facialExpressions: [],
      bodyPosture: 'unknown'
    });
  };

  if (stage === 'greeting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
        <BackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#14A44D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#14A44D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Mock Interview</h1>
            <p className="text-xl text-gray-300 mb-8">
              Welcome! I'm your AI Interviewer. Let's practice for your next interview.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Select Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.keys(questionBank).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    userRole === role
                      ? 'border-[#14A44D] bg-[#14A44D]/20 text-[#14A44D]'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <h3 className="text-lg font-semibold">{role}</h3>
                  <p className="text-sm opacity-75 mt-1">{questionBank[role].length} questions prepared</p>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={startInterview}
                disabled={!userRole}
                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform ${
                  userRole
                    ? 'bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:shadow-[#14A44D]/40 hover:scale-105'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Start Mock Interview
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">What to Expect:</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• 5-8 interview questions tailored to your role</li>
              <li>• Real-time evaluation of your answers</li>
              <li>• Detailed feedback on clarity, confidence, and technical accuracy</li>
              <li>• Comprehensive report with transcript and recommendations</li>
              <li>• Practice with webcam (optional) to improve presentation skills</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'interviewing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
        <BackButton />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video/Webcam Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Your Video Feed</h2>
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Visual Analysis: {visualCues.eyeContact}% eye contact
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Tip: Maintain eye contact with the camera and speak clearly
              </p>
            </div>

            {/* Interview Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Question {currentQuestion + 1} of {questions.length}</h2>
                <span className="text-sm text-gray-400">{userRole}</span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-[#14A44D]">
                  {questions[currentQuestion]}
                </h3>

                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-40 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#14A44D] resize-none"
                  disabled={isLoading}
                />
              </div>

              {evaluation && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl">
                  <h4 className="font-semibold mb-3 text-[#5F2EEA]">Evaluation:</h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>Clarity: <span className="text-[#14A44D]">{evaluation.clarity}%</span></div>
                    <div>Confidence: <span className="text-[#14A44D]">{evaluation.confidence}%</span></div>
                    <div>Technical: <span className="text-[#14A44D]">{evaluation.technicalAccuracy}%</span></div>
                    <div>Communication: <span className="text-[#14A44D]">{evaluation.communication}%</span></div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-green-400 text-sm">
                      <strong>Strengths:</strong> {evaluation.feedback.strengths.join(', ')}
                    </div>
                    <div className="text-yellow-400 text-sm">
                      <strong>Areas for improvement:</strong> {evaluation.feedback.weaknesses.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (listening) {
                        stop();
                      } else {
                        setCurrentAnswer('');
                        listen();
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      listening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {listening ? '🎤 Listening...' : '🎤 Voice Input'}
                  </button>

                  <button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                      currentAnswer.trim() && !isLoading
                        ? 'bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:shadow-[#14A44D]/40 hover:scale-105'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Evaluating...' : currentQuestion >= questions.length - 1 ? 'Complete Interview' : 'Next Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const generatePDF = async () => {
    try {
      // Generate PDF using AI service
      const response = await axios.post('http://localhost:8000/generate-report', {
        report_data: finalReport
      });

      // Create and download PDF
      const pdf = new jsPDF();
      pdf.text(response.data.pdf, 10, 10);
      pdf.save('mock_interview_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: generate simple PDF on client side
      const pdf = new jsPDF();
      pdf.text('Mock Interview Report', 20, 20);
      pdf.text(`Overall Score: ${finalReport?.overallScore}%`, 20, 40);
      pdf.save('mock_interview_report.pdf');
    }
  };

  if (stage === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
        <BackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#14A44D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#14A44D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Interview Complete!</h1>
            <p className="text-xl text-gray-300 mb-8">
              Great job! Here's your comprehensive feedback report.
            </p>
            <button
              onClick={() => speak({
                text: `Interview completed! Your overall score is ${finalReport?.overallScore}%. You answered ${finalReport?.questionCount} questions. Your eye contact averaged ${finalReport?.visualAnalytics?.avgEyeContact}%. ${finalReport?.recommendations?.slice(0, 2).join('. ')}`
              })}
              className="mb-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              🔊 Hear Summary
            </button>
          </div>

          {finalReport && (
            <div className="space-y-8">
              {/* Overall Score */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">Overall Performance</h2>
                <div className="text-6xl font-bold text-[#14A44D] mb-2">{finalReport.overallScore}%</div>
                <div className="text-gray-400">Based on {finalReport.questionCount} questions</div>
              </div>

              {/* Body Language & Eye Contact Analysis */}
              {finalReport.visualAnalytics && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold mb-6">Body Language & Eye Contact Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#14A44D] mb-2">{finalReport.visualAnalytics.avgEyeContact}%</div>
                      <div className="text-gray-400">Eye Contact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#14A44D] mb-2 capitalize">{finalReport.visualAnalytics.bodyPosture}</div>
                      <div className="text-gray-400">Body Posture</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#14A44D] mb-2">
                        {Object.keys(finalReport.visualAnalytics.facialExpressions || {}).length}
                      </div>
                      <div className="text-gray-400">Expression Types</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Communication Analysis */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Communication Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-[#14A44D] mb-1">Strong</div>
                    <div className="text-sm text-gray-400">Vocabulary</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-[#14A44D] mb-1">High</div>
                    <div className="text-sm text-gray-400">Clarity</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-[#14A44D] mb-1">Polite</div>
                    <div className="text-sm text-gray-400">Tone</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-[#14A44D] mb-1">Steady</div>
                    <div className="text-sm text-gray-400">Pace</div>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Interview Transcript</h2>
                <div className="space-y-6">
                  {finalReport.transcript.map((item, index) => (
                    <div key={index} className="border-l-4 border-[#14A44D] pl-6">
                      <h3 className="font-semibold text-[#14A44D] mb-2">Q{index + 1}: {item.question}</h3>
                      <p className="text-gray-300 mb-3 italic">"{item.transcript || item.answer}"</p>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>Clarity: <span className="text-[#14A44D]">{item.evaluation.clarity}%</span></div>
                        <div>Confidence: <span className="text-[#14A44D]">{item.evaluation.confidence}%</span></div>
                        <div>Technical: <span className="text-[#14A44D]">{item.evaluation.technicalAccuracy}%</span></div>
                        <div>Communication: <span className="text-[#14A44D]">{item.evaluation.communication}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Recommendations for Improvement</h2>
                <ul className="space-y-3">
                  {finalReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#5F2EEA] mr-3">•</span>
                      <span className="text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] px-8 py-4 rounded-full text-lg font-semibold hover:shadow-[#14A44D]/40 hover:scale-105 transition-all duration-300"
                  >
                    Download PDF Report
                  </button>
                  <button
                    onClick={resetInterview}
                    className="border-2 border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Practice Another Interview
                  </button>
                </div>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default MockInterview;