import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const SimpleQuiz = () => {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    loadLevel('javascript', 1);
  }, []);

  const loadLevel = async (lang, level) => {
    try {
      const response = await axios.get(`/api/quiz/${lang}/${level}`);
      if (response.data.question) {
        setQuestion(response.data.question);
        setShowSolution(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    } catch (e) {
      console.error('Failed to load level:', e);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const payload = {
      language: 'javascript',
      level: 1,
      questionId: question.id,
      answer: selectedAnswer,
      timeTaken: 10,
    };

    try {
      const { data } = await axios.post('/api/quiz/submit', payload);
      setIsCorrect(data.isCorrect);
      setShowSolution(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{question.question}</h2>
      <div>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedAnswer(idx)}
            disabled={showSolution}
          >
            {opt}
          </button>
        ))}
      </div>
      {!showSolution && (
        <button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
        >
          Submit Answer
        </button>
      )}
      {showSolution && (
        <div>
          <h3>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
          <p>{question.explanation}</p>
          <button onClick={() => loadLevel('javascript', 1)}>Next Question</button>
        </div>
      )}
    </div>
  );
};

export default SimpleQuiz;
