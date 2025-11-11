import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';
import axios from '../utils/axios';

const Internships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchInternships();
    fetchProjects();
  }, []);

  const fetchInternships = async () => {
    try {
      const { data } = await axios.get('/api/internships');
      setInternships(data.internships || []);

      // Get AI recommendations based on user skills
      if (user?.skills?.length > 0) {
        const recommendations = await getAIRecommendations(user.skills);
        setRecommendedInternships(recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`/api/projects/user/${user?.id}`);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const getAIRecommendations = async (userSkills) => {
    try {
      const { data } = await axios.post('/api/ai/recommend-internships', { skills: userSkills });
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      return [];
    }
  };

  const applyForInternship = async (internshipId) => {
    setApplying(internshipId);
    try {
      await axios.post(`/api/internships/${internshipId}/apply`);
      alert('Application submitted successfully!');
      setInternships(prev =>
        prev.map(internship =>
          internship._id === internshipId
            ? { ...internship, applicants: [...(internship.applicants || []), user.id] }
            : internship
        )
      );
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to apply for internship';
      console.error('Failed to apply for internship:', error);
      alert(msg);
    } finally {
      setApplying(null);
    }
  };

  const hasApplied = (internship) => {
    const applicants = internship.applicants || [];
    return Array.isArray(applicants) ? applicants.includes(user?.id) : false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#14A44D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Internships
              </h1>
              <p className="text-gray-400 mt-2">Find your dream internship with AI-powered recommendations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
              <span className="text-sm text-gray-400">Available: </span>
              <span className="text-[#14A44D] font-semibold">{internships.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Recommendations */}
        {recommendedInternships.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="mr-3">🤖</span>
              AI Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedInternships.map((internship) => (
                <div
                  key={internship._id}
                  className="bg-gradient-to-br from-[#14A44D]/20 to-[#5F2EEA]/20 backdrop-blur-xl border border-[#14A44D]/30 rounded-2xl p-6 hover:bg-[#14A44D]/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{internship.title}</h3>
                      <p className="text-[#14A44D] font-medium">{internship.company}</p>
                    </div>
                    <div className="bg-[#14A44D]/20 text-[#14A44D] px-3 py-1 rounded-full text-xs font-semibold">
                      AI Match
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{internship.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {internship.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-white/10 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Stipend:</span>
                      <span className="text-[#14A44D] font-semibold">{internship.stipend}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => applyForInternship(internship._id)}
                    disabled={hasApplied(internship) || applying === internship._id}
                    className="w-full bg-[#14A44D] text-white py-2 px-4 rounded-xl hover:bg-[#14A44D]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                  >
                    {hasApplied(internship) ? 'Applied' : applying === internship._id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
            {[
              { id: 'all', name: 'All Internships', icon: '📋' },
              { id: 'traditional', name: 'Traditional', icon: '🏢' },
              { id: 'project-based', name: 'Project-Based', icon: '🚀' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  filterType === tab.id
                    ? 'bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Project-Based Internships */}
        {filterType === 'project-based' && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="mr-3">🚀</span>
              Project-Based Internships
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.filter(internship => internship.type === 'project-based').map((internship) => (
                <div
                  key={internship._id}
                  className="bg-gradient-to-br from-[#FF6B6B]/20 to-[#4ECDC4]/20 backdrop-blur-xl border border-[#FF6B6B]/30 rounded-2xl p-6 hover:bg-[#FF6B6B]/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{internship.title}</h3>
                      <p className="text-[#FF6B6B] font-medium">{internship.company}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-[#FF6B6B]/20 text-[#FF6B6B] px-3 py-1 rounded-full text-xs font-semibold">
                        Project-Based
                      </div>
                      {internship.collaborationWithCompany && (
                        <div className="bg-[#4ECDC4]/20 text-[#4ECDC4] px-3 py-1 rounded-full text-xs font-semibold">
                          Company Collaboration
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{internship.description}</p>

                  {internship.projectDetails && (
                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-[#4ECDC4] mb-2">Project Details</h4>
                      <p className="text-gray-300 text-xs">{internship.projectDetails}</p>
                    </div>
                  )}

                  {internship.collaborationFeatures && internship.collaborationFeatures.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Collaboration Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {internship.collaborationFeatures.map((feature, index) => (
                          <span key={index} className="bg-[#4ECDC4]/20 text-[#4ECDC4] text-xs px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {internship.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-white/10 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Stipend:</span>
                      <span className="text-[#FF6B6B] font-semibold">{internship.stipend}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => applyForInternship(internship._id)}
                    disabled={hasApplied(internship) || applying === internship._id}
                    className="w-full bg-[#FF6B6B] text-white py-2 px-4 rounded-xl hover:bg-[#FF6B6B]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                  >
                    {hasApplied(internship) ? 'Applied' : applying === internship._id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traditional Internships */}
        {filterType === 'traditional' && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="mr-3">🏢</span>
              Traditional Internships
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.filter(internship => internship.type === 'traditional').map((internship) => (
                <div
                  key={internship._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{internship.title}</h3>
                      <p className="text-[#14A44D] font-medium">{internship.company}</p>
                    </div>
                    <div className="bg-white/20 text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
                      Traditional
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{internship.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {internship.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-white/10 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Stipend:</span>
                      <span className="text-[#14A44D] font-semibold">{internship.stipend}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => applyForInternship(internship._id)}
                    disabled={hasApplied(internship) || applying === internship._id}
                    className="w-full bg-[#5F2EEA] text-white py-2 px-4 rounded-xl hover:bg-[#5F2EEA]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                  >
                    {hasApplied(internship) ? 'Applied' : applying === internship._id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Internships */}
        {filterType === 'all' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">All Internships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <div
                  key={internship._id}
                  className={`backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 ${
                    internship.type === 'project-based'
                      ? 'bg-gradient-to-br from-[#FF6B6B]/20 to-[#4ECDC4]/20 border-[#FF6B6B]/30'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{internship.title}</h3>
                      <p className={`font-medium ${
                        internship.type === 'project-based' ? 'text-[#FF6B6B]' : 'text-[#14A44D]'
                      }`}>
                        {internship.company}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        internship.type === 'project-based'
                          ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                          : 'bg-white/20 text-gray-300'
                      }`}>
                        {internship.type === 'project-based' ? 'Project-Based' : 'Traditional'}
                      </div>
                      {internship.collaborationWithCompany && (
                        <div className="bg-[#4ECDC4]/20 text-[#4ECDC4] px-3 py-1 rounded-full text-xs font-semibold">
                          Company Collaboration
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{internship.description}</p>

                  {internship.type === 'project-based' && internship.projectDetails && (
                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-[#4ECDC4] mb-2">Project Details</h4>
                      <p className="text-gray-300 text-xs">{internship.projectDetails}</p>
                    </div>
                  )}

                  {internship.collaborationFeatures && internship.collaborationFeatures.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Collaboration Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {internship.collaborationFeatures.map((feature, index) => (
                          <span key={index} className="bg-[#4ECDC4]/20 text-[#4ECDC4] text-xs px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {internship.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-white/10 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Stipend:</span>
                      <span className={`font-semibold ${
                        internship.type === 'project-based' ? 'text-[#FF6B6B]' : 'text-[#14A44D]'
                      }`}>
                        {internship.stipend}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => applyForInternship(internship._id)}
                    disabled={hasApplied(internship) || applying === internship._id}
                    className={`w-full text-white py-2 px-4 rounded-xl hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold ${
                      internship.type === 'project-based'
                        ? 'bg-[#FF6B6B] hover:bg-[#FF6B6B]/80'
                        : 'bg-[#5F2EEA] hover:bg-[#5F2EEA]/80'
                    }`}
                  >
                    {hasApplied(internship) ? 'Applied' : applying === internship._id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;
