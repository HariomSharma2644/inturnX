import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
};

export default BackButton;
