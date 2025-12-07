import React, { useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

const ProfileSection = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('linkedin', linkedin);
      if (resume) {
        formData.append('resume', resume);
      }

      const { data } = await axios.put('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUpdate(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Home Profile</h3>
        <div>
          <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-gray-400 hover:text-white mr-4">
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <Link to="/profile" className="text-sm text-gray-400 hover:text-white">
            Settings
          </Link>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#14A44D] file:text-white hover:file:bg-[#14A44D]/80"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#14A44D] text-white py-3 px-6 rounded-xl hover:bg-[#14A44D]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">LinkedIn</p>
            <a href={user?.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
              {user?.linkedin || 'Not provided'}
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-400">Resume</p>
            <a href={user?.resumeLink} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
              {user?.resumeLink ? 'View Resume' : 'Not provided'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
