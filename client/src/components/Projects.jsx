import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';
import axios from '../utils/axios';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchCourses();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`/api/projects/user/${user?.id}`);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/api/courses');
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/zip') {
      setZipFile(file);
    } else {
      alert('Please select a valid ZIP file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || (!githubLink && !zipFile)) {
      alert('Please select a course and provide either a GitHub link or ZIP file');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      if (githubLink) formData.append('githubLink', githubLink);
      if (zipFile) formData.append('zipFile', zipFile);

      const { data } = await axios.post('/api/projects/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Project submitted successfully! AI analysis in progress...');
      setSelectedCourse('');
      setGithubLink('');
      setZipFile(null);
      fetchProjects(); // Refresh projects list
    } catch (error) {
      console.error('Failed to submit project:', error);
      alert('Failed to submit project');
    } finally {
      setSubmitting(false);
    }
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
      <BackButton />
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-gray-400 mt-2">Submit your projects and get AI-powered feedback</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
              <span className="text-sm text-gray-400">Total Projects: </span>
              <span className="text-[#14A44D] font-semibold">{projects.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Project Form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Submit New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                  required
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                />
                <p className="text-xs text-gray-500 mt-1">Or upload a ZIP file below</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload ZIP File
                </label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#14A44D] file:text-white hover:file:bg-[#14A44D]/80"
                />
                {zipFile && (
                  <p className="text-sm text-gray-400 mt-2">Selected: {zipFile.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#14A44D] text-white py-3 px-6 rounded-xl hover:bg-[#14A44D]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Project'}
              </button>
            </form>
          </div>

          {/* Projects List */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Your Projects</h2>
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No projects submitted yet</p>
                  <p className="text-sm text-gray-500 mt-2">Submit your first project to get started!</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project._id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{project.course?.title || 'Unknown Course'}</h3>
                        <p className="text-sm text-gray-400">
                          Submitted: {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'completed' ? 'bg-[#14A44D]/20 text-[#14A44D]' :
                        project.status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {project.status}
                      </div>
                    </div>

                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#14A44D] hover:underline text-sm"
                      >
                        View on GitHub →
                      </a>
                    )}

                    {project.aiScore && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">AI Score:</span>
                          <span className="text-[#14A44D] font-semibold">{project.aiScore}/100</span>
                        </div>
                        {project.aiFeedback && (
                          <p className="text-xs text-gray-500 mt-2">{project.aiFeedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
