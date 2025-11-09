import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BattleArena = () => {
  // const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1v1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Battle Arena
              </h1>
              <p className="text-gray-400 mt-2">Compete in 1v1 battles and climb the leaderboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Rating: </span>
                <span className="text-[#14A44D] font-semibold">1200</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                <span className="text-sm text-gray-400">Rank: </span>
                <span style={{ color: '#96CEB4' }} className="font-semibold">
                  Intermediate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="text-2xl font-bold text-green-400 mb-2">🎯 Battle Arena Ready!</div>
          <div className="text-lg text-gray-300 mb-4">Choose your battle mode below</div>
          <div className="flex justify-center space-x-4 text-sm text-gray-400">
            <span>⚡ Real-time competition</span>
            <span>•</span>
            <span>🧠 AI-powered problems</span>
            <span>•</span>
            <span>🏆 Global rankings</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
          {[
            { id: '1v1', name: '1v1 Battles', icon: '⚔️' },
            { id: 'practice', name: 'Practice Mode', icon: '🎯' },
            { id: 'friendly', name: 'Friendly Match', icon: '🤝' },
            { id: 'leaderboard', name: 'Leaderboard', icon: '🏆' },
            { id: 'stats', name: 'My Stats', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Practice Mode Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">🎯 Practice Mode</h2>
                <p className="text-gray-400">Sharpen your coding skills with unlimited practice problems</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl mb-2">🟢</div>
                  <div className="font-semibold text-green-400">Easy</div>
                  <div className="text-sm text-gray-400">Beginner friendly</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl mb-2">🟡</div>
                  <div className="font-semibold text-yellow-400">Medium</div>
                  <div className="text-sm text-gray-400">Intermediate level</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl mb-2">🔴</div>
                  <div className="font-semibold text-red-400">Hard</div>
                  <div className="text-sm text-gray-400">Challenge yourself</div>
                </div>
              </div>

              <div className="flex justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  🚀 Start Practice Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1v1 Battles Tab */}
        {activeTab === '1v1' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Find Your Match</h2>
                <p className="text-gray-400">Enter the queue and battle against players of similar skill</p>
              </div>

              <div className="flex justify-center space-x-4">
                <button className="px-8 py-4 bg-gradient-to-r from-[#FF4B2B] to-[#FF8E53] text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  ⚔️ Enter Competitive Queue
                </button>
                <button className="px-8 py-4 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  🎯 Enter Casual Queue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Friendly Match Tab */}
        {activeTab === 'friendly' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Friendly Match</h2>
                <p className="text-gray-400">Practice with friends without affecting your rating</p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  placeholder="Enter friend's username or battle code"
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D]"
                />
                <button className="w-full py-3 bg-gradient-to-r from-[#14A44D] to-[#5F2EEA] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  🤝 Send Challenge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">🏆 Global Leaderboard</h2>
                <p className="text-gray-400">Top competitive programmers</p>
              </div>
              <div className="text-center text-gray-300">
                Leaderboard feature coming soon!
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#14A44D] mb-2">0</div>
                <div className="text-gray-400">Total Battles</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#14A44D] mb-2">0</div>
                <div className="text-gray-400">Wins</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF4B2B] mb-2">0</div>
                <div className="text-gray-400">Losses</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5F2EEA] mb-2">0%</div>
                <div className="text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleArena;
