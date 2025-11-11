import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Certificate = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [language]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/quiz/certificate/${language}`);
      setCertificate(response.data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      // If no certificate exists, redirect to quiz
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      setDownloading(true);
      const response = await axios.get(`/api/quiz/certificate/${language}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `InturnX-${language}-Master-Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Certificate Not Found</h1>
          <p className="text-gray-300 mb-8">Complete all 100 levels to earn your certificate!</p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/quiz')}
                className="text-white hover:text-blue-300 transition-colors mb-2"
              >
                ← Back to Quiz
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Certificate
              </h1>
              <p className="text-gray-300 mt-2">Congratulations on mastering {certificate.language}!</p>
            </div>
            <button
              onClick={downloadCertificate}
              disabled={downloading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              {downloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>📥</span>
              )}
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Certificate Display */}
        <div className="bg-gradient-to-br from-[#0A0A0A]/80 via-[#1A1A1A]/80 to-[#2A2A2A]/80 backdrop-blur-sm rounded-lg border-2 border-[#14A44D]/30 p-8 mb-8">
          <div className="text-center">
            {/* Certificate Header */}
            <div className="mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                Certificate of Achievement
              </h2>
              <div className="text-xl text-gray-300">InturnX Programming Quiz Arena</div>
            </div>

            {/* Certificate Body */}
            <div className="mb-8">
              <div className="text-lg text-gray-300 mb-4">This is to certify that</div>
              <div className="text-3xl font-bold text-white mb-4">{certificate.userName}</div>
              <div className="text-lg text-gray-300 mb-6">
                has successfully completed all 100 levels of the
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {certificate.language} Programming Challenge
              </div>
              <div className="text-lg text-gray-300 mb-6">
                demonstrating exceptional programming skills and dedication
              </div>
            </div>

            {/* Certificate Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{certificate.totalScore}</div>
                <div className="text-sm text-gray-300">Total Score</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{certificate.accuracy}%</div>
                <div className="text-sm text-gray-300">Accuracy</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{Math.round(certificate.averageTime)}s</div>
                <div className="text-sm text-gray-300">Avg Time</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{certificate.completedDate}</div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="border-t border-white/20 pt-6">
              <div className="text-sm text-gray-400 mb-2">Certificate ID: {certificate.certificateId}</div>
              <div className="text-sm text-gray-400">Issued by InturnX Learning Platform</div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Share Your Achievement</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const text = `I just completed all 100 levels of ${certificate.language} in InturnX Programming Quiz Arena! 🏆 #InturnX #Programming`;
                navigator.share?.({ text }) || navigator.clipboard?.writeText(text);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>📱</span>
              <span>Share</span>
            </button>

            <button
              onClick={() => navigate('/quiz/leaderboard')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>🏆</span>
              <span>View Leaderboard</span>
            </button>

            <button
              onClick={() => navigate('/quiz')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>🎯</span>
              <span>Try Another Language</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
