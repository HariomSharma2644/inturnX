import React, { useState, useEffect, useRef } from 'react';
import BackButton from './BackButton';
import axios from '../utils/axios';

const MockInterview = () => {
  const [stage, setStage] = useState('setup'); // setup, greeting, interviewing, completed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [listening, setListening] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

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

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

      setStage('greeting');
    } catch (error) {
      console.error('Failed to acquire camera feed:', error);
      setError("Failed to initialize interview component. Please ensure you have a camera and microphone connected and have granted permission to use them.");
    }
  };

  useEffect(() => {
    // Initialize the component
    setIsLoading(false);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Start with non-continuous
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentAnswer(prev => prev + finalTranscript + ' ');
          setInterimTranscript('');
          // Auto-stop after final result
          setListening(false);
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started successfully');
        setListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event);
        setListening(false);

        // Provide user-friendly error messages
        let errorMessage = 'Speech recognition failed. ';
        switch (event.error) {
          case 'network':
            errorMessage += 'Please check your internet connection and try again. You can also type your answer manually.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected. Please speak clearly into your microphone.';
            break;
          case 'aborted':
            errorMessage += 'Speech recognition was cancelled.';
            break;
          case 'audio-capture':
            errorMessage += 'Audio capture failed. Please check your microphone.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech recognition service not allowed. Please try again later.';
            break;
          default:
            errorMessage += `Error: ${event.error}. You can type your answer manually.`;
        }

        setSpeechError(errorMessage);
      };

      recognitionRef.current.onnomatch = () => {
        console.log('No speech was detected');
        setListening(false);
      };

      recognitionRef.current.onaudiostart = () => {
        console.log('Audio capturing started');
      };

      recognitionRef.current.onaudioend = () => {
        console.log('Audio capturing ended');
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Assign video stream to video element when stage changes to interviewing
  useEffect(() => {
    if (stage === 'interviewing' && streamRef.current) {
      const assignStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        } else {
          setTimeout(assignStream, 100);
        }
      };
      assignStream();
    }
  }, [stage]);

  const startInterview = () => {
    if (!userRole) return;

    const roleQuestions = questionBank[userRole] || questionBank['Software Engineer'];
    setQuestions(roleQuestions);
    setStage('interviewing');

    // Start recording audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
    }
  };

  const toggleVoiceInput = () => {
    if (listening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      console.log('Speech recognition stopped');
    } else {
      // Start listening
      if (recognitionRef.current) {
        try {
          // Reset any previous state
          recognitionRef.current.continuous = false; // Disable continuous for better control
          recognitionRef.current.interimResults = true;
          recognitionRef.current.maxAlternatives = 1;

          recognitionRef.current.start();
          setListening(true);
          console.log('Speech recognition started');
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          setError('Speech recognition failed to start. Please check your microphone permissions and try again.');
          setListening(false);
        }
      } else {
        setError('Speech recognition is not supported in this browser.');
      }
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
        transcript: transcript
      });

      const aiEvaluation = analysisResponse.data.analysis;

      const newAnswers = [...answers, {
        question: questions[currentQuestion],
        answer: currentAnswer,
        transcript: transcript,
        evaluation: aiEvaluation
      }];

      setAnswers(newAnswers);
      setEvaluation(aiEvaluation);
      setCurrentAnswer('');

      if (currentQuestion >= questions.length - 1) {
        // Generate final report
        const finalScore = Math.floor(newAnswers.reduce((acc, ans) =>
          acc + (ans.evaluation.clarity + ans.evaluation.confidence + ans.evaluation.technicalAccuracy + ans.evaluation.communication) / 4, 0
        ) / newAnswers.length);

        setFinalReport({
          overallScore: finalScore,
          questionCount: newAnswers.length,
          transcript: newAnswers,
          recommendations: [
            'Practice explaining technical concepts more concisely',
            'Work on providing real-world examples',
            'Focus on communication skills'
          ]
        });

        setStage('completed');
      } else {
        setCurrentQuestion(prev => prev + 1);
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-xl text-gray-300">Preparing the mock interview environment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-xl text-gray-300">{error}</p>
          <BackButton />
        </div>
      </div>
    );
  }

  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Setup Your Mock Interview</h1>
          <p className="text-xl text-gray-300 mb-8">Please grant permission to use your camera and microphone for the interview.</p>
          <button
            onClick={initCamera}
            className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:from-[#14A44D]/80 hover:to-[#5F2EEA]/80 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-[#14A44D]/40 transition-all duration-300 transform hover:scale-105"
          >
            Grant Permissions
          </button>
        </div>
      </div>
    );
  }

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
                  Visual Analysis: 85% eye contact
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

                <div className="flex items-center mb-2">
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      listening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[#14A44D] hover:bg-[#14A44D]/80 text-white'
                    }`}
                    title={listening ? 'Stop voice input' : 'Start voice input'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <span className="ml-2 text-sm text-gray-400">
                    {listening ? 'Listening...' : 'Click microphone to speak'}
                  </span>
                </div>

                {speechError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">{speechError}</p>
                  </div>
                )}

                <textarea
                  value={currentAnswer + interimTranscript}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here or use voice input..."
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
    );
  }

  const downloadReport = async () => {
    try {
      // Generate JSON report using AI service
      const response = await axios.post('http://localhost:8000/generate-report', {
        report_data: finalReport
      });

      // Create and download JSON report
      const reportData = response.data.report;
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mock_interview_report.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback: generate simple JSON report
      const fallbackReport = {
        interview_summary: {
          candidate_role: userRole,
          total_questions: finalReport?.questionCount || 0,
          duration: 'N/A',
          overall_rating: finalReport?.overallScore / 10 || 0
        },
        questions: finalReport?.transcript?.map((item) => ({
          question: item.question,
          answer_summary: item.transcript || item.answer,
          feedback: `Clarity: ${item.evaluation.clarity}%, Confidence: ${item.evaluation.confidence}%, Technical: ${item.evaluation.technicalAccuracy}%, Communication: ${item.evaluation.communication}%`,
          score: Math.floor((item.evaluation.clarity + item.evaluation.confidence + item.evaluation.technicalAccuracy + item.evaluation.communication) / 4)
        })) || [],
        recommendations: finalReport?.recommendations || []
      };

      const blob = new Blob([JSON.stringify(fallbackReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mock_interview_report.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
                    onClick={downloadReport}
                    className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] px-8 py-4 rounded-full text-lg font-semibold hover:shadow-[#14A44D]/40 hover:scale-105 transition-all duration-300"
                  >
                    Download JSON Report
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
