import React, { useState } from 'react';
import axios from '../utils/axios';
import BackButton from './BackButton';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a PDF or text file');
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Read file content as text
      const text = await file.text();

      const response = await axios.post('/api/ai/analyze-resume', {
        resume: text
      });
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Resume analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      <BackButton />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Resume Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            Upload your resume and get AI-powered analysis and suggestions
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Resume (PDF or Text)
              </label>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF8E53] file:text-white hover:file:bg-[#FF8E53]/80"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full bg-gradient-to-r from-[#FF8E53] to-[#FF4B2B] text-white py-3 px-6 rounded-full hover:shadow-[#FF4B2B]/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Overall Score</h2>
              <div className="flex items-center">
                <div className="text-6xl font-bold text-[#FF8E53] mr-4">
                  {analysis.overall_score}/100
                </div>
                <div>
                  <p className="text-gray-300">Based on skills, experience, and resume quality</p>
                </div>
              </div>
            </div>

            {/* Skills Extracted */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Skills Extracted</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analysis.skills_extracted).map(([category, skills]) => (
                  skills.length > 0 && (
                    <div key={category}>
                      <h3 className="font-semibold text-white mb-2 capitalize">{category.replace('_', ' ')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span key={index} className="bg-[#FF8E53]/20 text-[#FF8E53] px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Experience</h2>
              <p className="text-gray-300">
                Estimated {analysis.experience_years} years of experience
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Recommendations</h2>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Internships */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Suggested Internship Types</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.suggested_internships.map((internship, index) => (
                  <span key={index} className="bg-[#5F2EEA]/20 text-[#5F2EEA] px-4 py-2 rounded-full text-sm">
                    {internship}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
