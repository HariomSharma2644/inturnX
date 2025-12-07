import React from 'react';

const ProgressOverview = ({ stats }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 mb-8">
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <span className="mr-3">📊</span>
      Progress Overview
    </h3>
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Overall Progress</span>
        <span className="text-sm text-[#14A44D] font-semibold">
          {Math.round((stats.completedCourses / Math.max(stats.completedCourses + 2, 1)) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.round((stats.completedCourses / Math.max(stats.completedCourses + 2, 1)) * 100)}%` }}
        ></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-4 bg-white/5 rounded-xl">
        <div className="text-2xl font-bold text-[#14A44D] mb-1">{stats.completedCourses}</div>
        <div className="text-sm text-gray-400">Courses Completed</div>
        <div className="text-xs text-gray-500 mt-1">Keep learning!</div>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-xl">
        <div className="text-2xl font-bold text-[#5F2EEA] mb-1">{stats.totalProjects}</div>
        <div className="text-sm text-gray-400">Projects Submitted</div>
        <div className="text-xs text-gray-500 mt-1">Great work!</div>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-xl">
        <div className="text-2xl font-bold text-[#FF4B2B] mb-1">{stats.battlesWon}</div>
        <div className="text-sm text-gray-400">Battles Won</div>
        <div className="text-xs text-gray-500 mt-1">Keep fighting!</div>
      </div>
    </div>
  </div>
);

export default ProgressOverview;
