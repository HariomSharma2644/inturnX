import React from 'react';

const AchievementsSection = ({ badges }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 mb-8">
    <h3 className="text-xl font-semibold mb-4 flex items-center">
      <span className="mr-3">🏆</span>
      Achievements & Badges
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.length > 0 ? badges.map((badge, index) => (
        <div key={index} className="text-center p-4 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-sm font-medium text-yellow-400">{badge.name || 'Achievement'}</div>
          <div className="text-xs text-gray-400">{badge.date || 'Earned recently'}</div>
        </div>
      )) : (
        <>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-sm font-medium text-yellow-400">First Steps</div>
            <div className="text-xs text-gray-400">Complete first course</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-xl border border-gray-400/30">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-sm font-medium text-gray-400">Battle Ready</div>
            <div className="text-xs text-gray-400">Win first battle</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-xl border border-gray-400/30">
            <div className="text-3xl mb-2">🧠</div>
            <div className="text-sm font-medium text-gray-400">Quiz Master</div>
            <div className="text-xs text-gray-400">Score 100% on quiz</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-xl border border-gray-400/30">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-sm font-medium text-gray-400">Project Star</div>
            <div className="text-xs text-gray-400">Submit first project</div>
          </div>
        </>
      )}
    </div>
  </div>
);

export default AchievementsSection;
