import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    duration: '',
    modules: []
  });

  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    industry: '',
    website: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, coursesRes, companiesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/companies')
      ]);

      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const companiesData = await companiesRes.json();

      setUsers(usersData.users || []);
      setCourses(coursesData.courses || []);
      setCompanies(companiesData.companies || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        alert('Course created successfully!');
        setNewCourse({
          title: '',
          description: '',
          category: '',
          difficulty: 'Beginner',
          duration: '',
          modules: []
        });
        fetchData();
      } else {
        alert('Failed to create course');
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        alert('Company created successfully!');
        setNewCompany({
          name: '',
          description: '',
          industry: '',
          website: ''
        });
        fetchData();
      } else {
        alert('Failed to create company');
      }
    } catch (error) {
      console.error('Failed to create company:', error);
      alert('Failed to create company');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        alert('User role updated successfully!');
        fetchData();
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

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
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-2">Manage users, courses, and companies</p>
            </div>
            <div className="flex space-x-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Users: </span>
                <span className="text-[#14A44D] font-semibold">{users.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Courses: </span>
                <span className="text-[#14A44D] font-semibold">{courses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
          {[
            { id: 'users', label: 'Users', count: users.length },
            { id: 'courses', label: 'Courses', count: courses.length },
            { id: 'companies', label: 'Companies', count: companies.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#14A44D] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">User Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">XP</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 text-sm">{user.name}</td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                            user.role === 'instructor' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{user.xp || 0}</td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user._id, e.target.value)}
                            className="bg-black/50 border border-white/20 rounded px-3 py-1 text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-8">
              {/* Create Course Form */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6">Create New Course</h2>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Course Title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                      required
                    />
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="DevOps">DevOps</option>
                      <option value="AI/ML">AI/ML</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Course Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D] resize-none"
                    rows={3}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={newCourse.difficulty}
                      onChange={(e) => setNewCourse({...newCourse, difficulty: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Duration (e.g., 4 weeks)"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#14A44D] text-white py-3 px-6 rounded-xl hover:bg-[#14A44D]/80 transition-colors"
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              </div>

              {/* Courses List */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-semibold">All Courses</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {courses.map((course) => (
                    <div key={course._id} className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{course.category}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                          course.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="space-y-8">
              {/* Create Company Form */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6">Add New Company</h2>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={newCompany.website}
                      onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Industry"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                      className="bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#14A44D] text-white py-3 px-6 rounded-xl hover:bg-[#14A44D]/80 transition-colors"
                    >
                      Add Company
                    </button>
                  </div>
                  <textarea
                    placeholder="Company Description"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D] resize-none"
                    rows={3}
                  />
                </form>
              </div>

              {/* Companies List */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-semibold">All Companies</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {companies.map((company) => (
                    <div key={company._id} className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold mb-2">{company.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{company.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{company.industry}</span>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#14A44D] hover:underline"
                        >
                          Visit →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
