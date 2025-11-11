const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const QuizProgress = require('../models/QuizProgress');
const { auth } = require('../middleware/auth');

// Get leaderboard for a language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { type = 'global' } = req.query; // global, weekly, monthly

    if (!['javascript', 'python', 'cpp', 'java', 'c', 'go', 'kotlin', 'rust', 'typescript', 'swift'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    if (!['global', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ message: 'Invalid leaderboard type' });
    }

    // Try to get cached leaderboard
    let leaderboard = await Leaderboard.findOne({ language, type });

    // If no cached leaderboard or it's old (more than 1 hour for global, 10 min for others), refresh it
    const shouldRefresh = !leaderboard ||
      (type === 'global' && Date.now() - leaderboard.lastUpdated > 3600000) || // 1 hour
      (type !== 'global' && Date.now() - leaderboard.lastUpdated > 600000); // 10 minutes

    if (shouldRefresh) {
      // Calculate period for weekly/monthly
      let period = {};
      if (type === 'weekly') {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        period = { startDate: startOfWeek, endDate: endOfWeek };
      } else if (type === 'monthly') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        period = { startDate: startOfMonth, endDate: endOfMonth };
      }

      // Get top performers
      const topPerformers = await QuizProgress.aggregate([
        { $match: { language } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: 1,
            username: '$user.username',
            avatar: '$user.avatar',
            score: '$totalScore',
            completedLevels: '$completedLevels',
            accuracy: '$accuracy',
            averageTime: '$averageTime',
            badges: '$badges'
          }
        },
        { $sort: { score: -1, completedLevels: -1, accuracy: -1 } },
        { $limit: 100 }
      ]);

      // Create or update leaderboard
      if (!leaderboard) {
        leaderboard = new Leaderboard({
          language,
          type,
          period,
          rankings: topPerformers.map((performer, index) => ({
            ...performer,
            rank: index + 1,
            lastUpdated: new Date()
          }))
        });
      } else {
        leaderboard.rankings = topPerformers.map((performer, index) => ({
          ...performer,
          rank: index + 1,
          lastUpdated: new Date()
        }));
        leaderboard.period = period;
        leaderboard.lastUpdated = new Date();
      }

      await leaderboard.save();
    }

    res.json(leaderboard);

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rank in leaderboard
router.get('/:language/rank', auth, async (req, res) => {
  try {
    const { language } = req.params;
    const { type = 'global' } = req.query;

    const userProgress = await QuizProgress.findOne({
      userId: req.user.id,
      language
    });

    if (!userProgress) {
      return res.json({
        rank: null,
        score: 0,
        totalParticipants: 0
      });
    }

    // Get user's position
    const higherRanked = await QuizProgress.countDocuments({
      language,
      $or: [
        { totalScore: { $gt: userProgress.totalScore } },
        {
          totalScore: userProgress.totalScore,
          $or: [
            { completedLevels: { $gt: userProgress.completedLevels } },
            {
              completedLevels: userProgress.completedLevels,
              accuracy: { $gt: userProgress.accuracy }
            }
          ]
        }
      ]
    });

    const totalParticipants = await QuizProgress.countDocuments({ language });

    res.json({
      rank: higherRanked + 1,
      score: userProgress.totalScore,
      completedLevels: userProgress.completedLevels,
      accuracy: userProgress.accuracy,
      totalParticipants
    });

  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get global leaderboard across all languages
router.get('/global/top', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const topPerformers = await QuizProgress.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$totalScore' },
          totalCompletedLevels: { $sum: '$completedLevels' },
          languagesPlayed: { $addToSet: '$language' },
          bestAccuracy: { $max: '$accuracy' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          avatar: '$user.avatar',
          totalScore: 1,
          totalCompletedLevels: 1,
          languagesPlayed: { $size: '$languagesPlayed' },
          bestAccuracy: 1
        }
      },
      { $sort: { totalScore: -1, totalCompletedLevels: -1, bestAccuracy: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      rankings: topPerformers.map((performer, index) => ({
        ...performer,
        rank: index + 1
      }))
    });

  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
