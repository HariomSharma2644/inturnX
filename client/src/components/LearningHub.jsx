import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories';
import BackButton from './BackButton';

const LearningHub = () => {
  const { user } = useAuth();
  const [learningPaths, setLearningPaths] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setLearningPaths(response.data.learningPaths);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllCourses = () => {
    const allCourses = [];
    Object.values(learningPaths).forEach(courses => {
      allCourses.push(...courses);
    });
    return allCourses;
  };

  const filteredCourses = getAllCourses().filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getProgressPercentage = (course) => {
    return course.progress?.percentage || 0;
  };

  const getCourseStatus = (course) => {
    const progress = getProgressPercentage(course);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  const isCourseLocked = (course) => {
    // First course in each path is always unlocked
    if (course.order === 1) return false;

    // Check if previous course in the same category is completed
    const categoryCourses = learningPaths[course.category] || [];
    const previousCourse = categoryCourses.find(c => c.order === course.order - 1);
    if (!previousCourse) return false;

    return previousCourse.progress?.status !== 'completed';
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
                Learning Hub
              </h1>
              <p className="text-gray-400 mt-2">Master new skills with unlimited open source courses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">XP: </span>
                <span className="text-[#14A44D] font-semibold">{user?.xp || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses, technologies, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D] focus:border-transparent"
            />
            <svg className="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm text-gray-400 mr-2">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Learning Paths */}
        {Object.entries(learningPaths).map(([categoryName, courses]) => (
          <div key={categoryName} className="mb-12">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white mr-4">{categoryName}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#14A44D] to-[#5F2EEA]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const progress = getProgressPercentage(course);
                const status = getCourseStatus(course);
                const isLocked = isCourseLocked(course);

                return (
                  <div
                    key={course._id}
                    className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                      isLocked ? 'opacity-50 grayscale' : 'hover:bg-white/15'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <p className="text-sm text-gray-400">{course.category}</p>
                            {isLocked && (
                              <svg className="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                          <div className="flex items-center text-sm text-gray-400 mb-3">
                            {course.videos && <span>🎥 {course.videos} videos</span>}
                            {course.project && <span className="ml-4">💻 {course.project}</span>}
                          </div>

                          {/* Progress Bar */}
                          {progress > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {isLocked ? (
                        <div className="w-full py-3 px-4 rounded-xl font-medium text-center bg-gray-600 text-gray-400 cursor-not-allowed">
                          🔒 Complete Previous Course
                        </div>
                      ) : (
                        <Link
                          to={`/course/${course._id}`}
                          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-center block ${
                            status === 'completed'
                              ? 'bg-green-600 hover:bg-green-700'
                              : status === 'in-progress'
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] hover:shadow-lg'
                          } text-white`}
                        >
                          {status === 'completed' ? 'Review Course' : status === 'in-progress' ? 'Continue Course' : 'Start Course'}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;
