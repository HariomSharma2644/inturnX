import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { LANGUAGES } from '../data/quizBank';
import BackButton from './BackButton';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].key);
  const [selectedType, setSelectedType] = useState('global');
  const [leaderboard, setLeaderboard] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedLanguage, selectedType]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, userRankRes] = await Promise.all([
        axios.get(`/api/leaderboard/${selectedLanguage}?type=${selectedType}`),
        axios.get(`/api/leaderboard/${selectedLanguage}/rank?type=${selectedType}`)
      ]);

      setLeaderboard(leaderboardRes.data);
      setUserRank(userRankRes.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#2A2A2A] text-white">
      <BackButton />
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <p className="text-gray-300 mt-2">See how you rank against other programmers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.key} value={lang.key}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="global">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Your Rank</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${getRankColor(userRank.rank)}`}>
                  {getRankIcon(userRank.rank)}
                </div>
                <div>
                  <div className="text-lg font-semibold">Rank #{userRank.rank}</div>
                  <div className="text-gray-300">Score: {userRank.score}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">Completed Levels: {userRank.completedLevels}</div>
                <div className="text-sm text-gray-300">Accuracy: {Math.round(userRank.accuracy)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-xl font-bold">
              {LANGUAGES.find(l => l.key === selectedLanguage)?.label} {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Leaderboard
            </h3>
            <p className="text-gray-300 text-sm">Total Participants: {leaderboard?.totalParticipants || 0}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Levels</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaderboard?.rankings?.map((player, index) => (
                  <tr key={player.userId} className={`hover:bg-white/5 ${index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${getRankColor(player.rank)}`}>
                        {getRankIcon(player.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {player.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{player.username}</div>
                          {player.badges && player.badges.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {player.badges.slice(0, 3).map((badge, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300">
                                  {badge.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                      {player.score.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {player.completedLevels}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {Math.round(player.accuracy)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {Math.round(player.averageTime)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!leaderboard?.rankings || leaderboard.rankings.length === 0) && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-lg">No rankings available yet</div>
              <div className="text-gray-500 text-sm mt-2">Be the first to complete some levels!</div>
            </div>
          )}
        </div>

        {/* Global Leaderboard */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-6">Global Champions</h3>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-gray-300 mb-4">Top performers across all programming languages</p>
            <button
              onClick={() => navigate('/quiz/leaderboard/global')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              View Global Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
