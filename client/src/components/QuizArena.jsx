import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from '../utils/axios';
import { AnimatePresence } from 'framer-motion';
import BackButton from './BackButton';

const QuizArena = () => {
  const { language, level } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [lifelineUsed, setLifelineUsed] = useState(null);
  const timerRef = useRef(null);

  // Language configurations
  const languageConfig = {
    javascript: { name: 'JavaScript', defaultCode: 'console.log("Hello World");' },
    python: { name: 'Python', defaultCode: 'print("Hello World")' },
    cpp: { name: 'C++', defaultCode: '#include <iostream>\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}' },
    java: { name: 'Java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}' }
  };

  useEffect(() => {
    fetchQuestion();
  }, [language, level]);

  useEffect(() => {
    if (timeLeft > 0 && question?.type !== 'full_problem') {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && question?.type !== 'full_problem') {
      handleSubmit();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/quiz/${language}/${level}`);
      if (response.data.levelComplete) {
        // All questions for this level are solved, navigate to the next level
        navigate(`/quiz/${language}/${parseInt(level) + 1}`);
        return;
      }
      setQuestion(response.data.question);
      setProgress(response.data.progress);

      // Set timer based on question type
      if (response.data.question.type === 'mcq') {
        setTimeLeft(30);
      } else if (response.data.question.type === 'output_prediction') {
        setTimeLeft(60);
      }

      // Set default code
      setCode(languageConfig[language]?.defaultCode || '');
    } catch (error) {
      console.error('Error fetching question:', error);
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
        language,
        level: parseInt(level),
        questionId: question.id,
        timeTaken: question.type === 'full_problem' ? 0 : (question.type === 'mcq' ? 30 - timeLeft : 60 - timeLeft),
        answer: question.type === 'mcq' ? parseInt(answer, 10) : (question.type === 'output_prediction' ? answer : null),
        code: (question.type === 'short_code' || question.type === 'full_problem') ? code : '',
        lifelineUsed
      };

      const response = await axios.post('/api/quiz/submit', submissionData);
      setResult(response.data);
      setShowResult(true);

      // Auto proceed to next level after 3 seconds
      setTimeout(() => {
        setShowResult(false);
        if (response.data.isCorrect) {
          navigate(`/quiz/${language}/${parseInt(level) + 1}`);
        } else {
          navigate('/quiz');
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleExecuteCode = async () => {
    if (!code.trim()) return;

    setExecuting(true);
    try {
      const response = await axios.post('/api/code/execute', {
        language,
        code,
        input: ''
      });

      setTestResults({
        stdout: response.data.stdout,
        stderr: response.data.stderr,
        status: response.data.status,
        time: response.data.time,
        memory: response.data.memory
      });
    } catch (error) {
      console.error('Error executing code:', error);
      setTestResults({
        error: 'Failed to execute code'
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleLifeline = async (type) => {
    if (progress.coins < 10) return;

    try {
      await axios.post('/api/quiz/lifeline', { language, lifelineType: type });
      setLifelineUsed(type);

      if (type === 'fifty_fifty' && question.type === 'mcq') {
        // Remove two wrong options
        const correctIndex = question.answerIndex;
        const wrongOptions = question.options
          .map((_, index) => index)
          .filter(index => index !== correctIndex);
        const toRemove = wrongOptions.slice(0, 2);
        setQuestion(prev => ({
          ...prev,
          options: prev.options.filter((_, index) => !toRemove.includes(index))
        }));
      }
    } catch (error) {
      console.error('Error using lifeline:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#2A2A2A] text-white">
      <BackButton />
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{languageConfig[language]?.name} - Level {level}</h1>
            <p className="text-gray-300">Question Type: {question?.type?.replace('_', ' ').toUpperCase()}</p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Coins */}
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">🪙</span>
              <span>{progress?.coins || 0}</span>
            </div>

            {/* Timer */}
            {timeLeft > 0 && (
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  timeLeft > 10 ? 'border-green-400' : 'border-red-400'
                }`}>
                  <span className="text-sm font-bold">{timeLeft}</span>
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${timeLeft > 10 ? 'bg-green-400' : 'bg-red-400'} transition-all duration-1000`}
                    style={{ width: `${(timeLeft / (question?.type === 'mcq' ? 30 : 60)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lifelines */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleLifeline('fifty_fifty')}
                disabled={progress?.coins < 10 || lifelineUsed === 'fifty_fifty'}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded text-sm"
              >
                50-50
              </button>
              <button
                onClick={() => handleLifeline('hint')}
                disabled={progress?.coins < 10 || lifelineUsed === 'hint'}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
              >
                Hint
              </button>
              <button
                onClick={() => handleLifeline('skip')}
                disabled={progress?.coins < 10 || lifelineUsed === 'skip'}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded text-sm"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Section */}
          <div className="space-y-6">
            <div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4">{question?.question}</h2>

              {question?.type === 'mcq' && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={answer === index.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="text-blue-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question?.type === 'output_prediction' && (
                <div className="space-y-4">
                  <p className="text-gray-300">Predict the output of the following code:</p>
                  <pre className="bg-black/50 p-4 rounded overflow-x-auto">
                    <code>{question.codeExample}</code>
                  </pre>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter expected output"
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {(question?.type === 'short_code' || question?.type === 'full_problem') && (
                <div className="space-y-4">
                  <p className="text-gray-300">Write code to solve this problem:</p>
                  <div className="bg-black/50 p-4 rounded">
                    <p>{question.description}</p>
                    {question.constraints && (
                      <div className="mt-4">
                        <h4 className="font-bold">Constraints:</h4>
                        <ul className="list-disc list-inside">
                          {question.constraints.map((constraint, index) => (
                            <li key={index}>{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Execution Result</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={testResults.status?.id === 3 ? 'text-green-400' : 'text-red-400'}>
                      {testResults.status?.description}
                    </span>
                  </div>
                  {testResults.stdout && (
                    <div>
                      <span>Output:</span>
                      <pre className="bg-black/50 p-2 rounded mt-1 overflow-x-auto">
                        {testResults.stdout}
                      </pre>
                    </div>
                  )}
                  {testResults.stderr && (
                    <div>
                      <span>Error:</span>
                      <pre className="bg-red-900/50 p-2 rounded mt-1 overflow-x-auto">
                        {testResults.stderr}
                      </pre>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Time: {testResults.time}s</span>
                    <span>Memory: {testResults.memory}KB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Editor Section */}
          {(question?.type === 'short_code' || question?.type === 'full_problem') && (
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Code Editor</h3>
                  <button
                    onClick={handleExecuteCode}
                    disabled={executing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
                  >
                    {executing ? 'Running...' : 'Run Code'}
                  </button>
                </div>
                <Editor
                  height="400px"
                  language={language}
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={
              (question?.type === 'mcq' && !answer) ||
              ((question?.type === 'output_prediction' || question?.type === 'short_code' || question?.type === 'full_problem') && !code.trim())
            }
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-lg font-bold transition-colors"
          >
            Submit Answer
          </button>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`p-8 rounded-lg text-center max-w-md mx-4 ${
                result.isCorrect ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              <div className="text-6xl mb-4">
                {result.isCorrect ? '🎉' : '😞'}
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {result.isCorrect ? 'Correct!' : 'Incorrect'}
              </h2>
              <p className="mb-4">{result.explanation}</p>
              {result.codeExample && (
                <div className="mb-4 text-left">
                  <h3 className="font-bold mb-2">Solution:</h3>
                  <pre className="bg-black/50 p-3 rounded text-sm overflow-x-auto">
                    <code>{result.codeExample}</code>
                  </pre>
                </div>
              )}
              <div className="text-sm opacity-75">
                Score: +{result.score} points
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizArena;
