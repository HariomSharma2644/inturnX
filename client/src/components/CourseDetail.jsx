import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';

// Certificate Component
const CertificateModal = ({ course, user, onClose }) => {
  const generateCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#0A0A0A');
    gradient.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#14A44D';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 560);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', 400, 100);

    // InturnX Logo/Brand
    ctx.fillStyle = '#5F2EEA';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('InturnX Learning Platform', 400, 140);

    // Certificate text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText('This is to certify that', 400, 200);

    // Student name
    ctx.fillStyle = '#14A44D';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(user?.name || 'Student', 400, 250);

    // Completion text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('has successfully completed the course', 400, 300);

    // Course name
    ctx.fillStyle = '#5F2EEA';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(course.title, 400, 340);

    // Skills
    if (course.skills) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText(`Skills Acquired: ${course.skills.join(', ')}`, 400, 380);
    }

    // Date
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.fillText(`Completed on ${new Date().toLocaleDateString()}`, 400, 420);

    // Signature line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 480);
    ctx.lineTo(350, 480);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText('InturnX Platform', 275, 500);

    // Download
    const link = document.createElement('a');
    link.download = `${course.title.replace(/\s+/g, '_')}_Certificate.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#14A44D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#14A44D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">🎉 Congratulations!</h2>
          <p className="text-gray-300 mb-6">
            You have successfully completed <span className="text-[#14A44D] font-semibold">{course.title}</span>
          </p>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Skills Acquired:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {course.skills?.map((skill, index) => (
                <span key={index} className="bg-[#5F2EEA]/20 text-[#5F2EEA] px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={generateCertificate}
              className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              📜 Download Certificate
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data.course);
        setProgress(response.data.progress.percentage || 0);
        setCompletedLessons(response.data.progress.completedModules?.map(m => m.moduleIndex) || []);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const markLessonComplete = async (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      try {
        await axios.post(`/api/courses/${id}/progress`, {
          moduleIndex: lessonId,
          completed: true
        });

        const newCompletedLessons = [...completedLessons, lessonId];
        setCompletedLessons(newCompletedLessons);
        const newProgress = (newCompletedLessons.length / course.modules.length) * 100;
        setProgress(newProgress);

        if (newProgress === 100) {
          setShowCertificate(true);
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizScore(null);
  };

  const submitQuiz = () => {
    const currentLessonData = course.modules[currentLesson];
    let score = 0;
    if (currentLessonData.quiz && currentLessonData.quiz.questions) {
      currentLessonData.quiz.questions.forEach((question, index) => {
        if (quizAnswers[index] === question.correctAnswer) {
          score++;
        }
      });
      setQuizScore(score);
      if (score === currentLessonData.quiz.questions.length) {
        markLessonComplete(currentLesson);
      }
    }
  };





  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#14A44D]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link to="/learning" className="text-[#14A44D] hover:underline">
            Back to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  const currentLessonData = course.modules[currentLesson];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      <BackButton />
      {showCertificate && <CertificateModal course={course} user={user} onClose={() => setShowCertificate(false)} />}

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/learning" className="text-[#14A44D] hover:underline mb-2 inline-block">
                ← Back to Learning Hub
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {course.title}
              </h1>
              <p className="text-gray-400 mt-2">{course.description}</p>
              <p className="text-gray-400 mt-2">{course.content}</p>
              <p className="text-gray-400 mt-2">{course.includes}</p>
              <p className="text-gray-400 mt-2">{course.certificate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Progress: </span>
                <span className="text-[#14A44D] font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Level: </span>
                <span className="text-[#5F2EEA] font-semibold">{course.difficulty}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Duration: </span>
                <span className="text-[#5F2EEA] font-semibold">{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Course Content</h3>
              <div className="space-y-2">
                {course.modules.map((module, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentLesson === index
                        ? 'bg-[#14A44D]/20 border border-[#14A44D]/30'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        completedLessons.includes(index)
                          ? 'bg-[#14A44D] text-white'
                          : currentLesson === index
                          ? 'bg-[#5F2EEA] text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {completedLessons.includes(index) ? '✓' : index + 1}
                      </div>
                      <span className={`text-sm ${
                        currentLesson === index ? 'text-white font-medium' : 'text-gray-300'
                      }`}>
                        {module.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-center block"
              >
                Generate Certificate
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!showQuiz ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">{currentLessonData.title}</h2>

                {/* Lesson Content */}
                <div className="prose prose-invert max-w-none mb-8">
                  <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                    {currentLessonData.content}
                  </p>
                  {currentLessonData.videoUrl && (
                    <a href={currentLessonData.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Watch Video
                    </a>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                    className="px-6 py-3 bg-gray-600 text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
                  >
                    Previous Lesson
                  </button>

                  <div className="flex space-x-4">
                    {currentLessonData.quiz && currentLessonData.quiz.questions && (
                      <button
                        onClick={startQuiz}
                        className="px-6 py-3 bg-[#5F2EEA] text-white rounded-xl hover:bg-[#5F2EEA]/80 transition-colors"
                      >
                        Take Quiz
                      </button>
                    )}

                    <button
                      onClick={() => {
                        markLessonComplete(currentLesson);
                        setCurrentLesson(Math.min(course.modules.length - 1, currentLesson + 1));
                      }}
                      disabled={currentLesson === course.modules.length - 1}
                      className="px-6 py-3 bg-[#14A44D] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#14A44D]/80 transition-colors"
                    >
                      Next Lesson
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Quiz Interface */
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Practice Questions</h2>

                {quizScore === null ? (
                  <div className="space-y-6">
                    {currentLessonData.quiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="bg-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-medium mb-4">{question.question}</h3>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <label key={oIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={option}
                                onChange={(e) => setQuizAnswers({
                                  ...quizAnswers,
                                  [qIndex]: e.target.value
                                })}
                                className="text-[#14A44D] focus:ring-[#14A44D]"
                              />
                              <span className="text-gray-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition-colors"
                      >
                        Back to Lesson
                      </button>
                      <button
                        onClick={submitQuiz}
                        className="px-6 py-3 bg-[#14A44D] text-white rounded-xl hover:bg-[#14A44D]/80 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Quiz Results */
                  <div className="text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      quizScore === currentLessonData.quiz.questions.length
                        ? 'bg-[#14A44D]/20'
                        : 'bg-[#FF4B2B]/20'
                    }`}>
                      <span className={`text-3xl font-bold ${
                        quizScore === currentLessonData.quiz.questions.length
                          ? 'text-[#14A44D]'
                          : 'text-[#FF4B2B]'
                      }`}>
                        {quizScore}/{currentLessonData.quiz.questions.length}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-4">
                      {quizScore === currentLessonData.quiz.questions.length
                        ? 'Great job!'
                        : 'Good try! Review the material and try again.'}
                    </h3>

                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition-colors"
                      >
                        Back to Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;