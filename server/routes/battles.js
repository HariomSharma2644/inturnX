const express = require('express');
const router = express.Router();
const Battle = require('../models/Battle');
const BattleResult = require('../models/BattleResult');
const { auth } = require('../middleware/auth');

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all battle results for leaderboard calculation
    const battleResults = await BattleResult.find({})
      .populate('players.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(1000);

    // Calculate leaderboard stats
    const playerStats = new Map();

    battleResults.forEach(result => {
      result.players.forEach(player => {
        const id = player.userId._id.toString();
        if (!playerStats.has(id)) {
          playerStats.set(id, {
            id,
            name: player.userName,
            rating: player.ratingAfter,
            wins: 0,
            losses: 0,
            totalBattles: 0,
            winRate: 0
          });
        }

        const stats = playerStats.get(id);
        stats.totalBattles += 1;

        if (player.result === 'win') {
          stats.wins += 1;
        } else if (player.result === 'loss') {
          stats.losses += 1;
        }

        // Update to latest rating
        stats.rating = player.ratingAfter;
        stats.winRate = Math.round((stats.wins / stats.totalBattles) * 100);
      });
    });

    // Convert to array and sort by rating
    const leaderboard = Array.from(playerStats.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 50); // Top 50 players

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Get user battle statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all battle results for this user
    const battleResults = await BattleResult.find({
      'players.userId': userId
    }).sort({ createdAt: -1 });

    let totalBattles = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let currentRating = 1200; // Default rating
    let totalRatingChange = 0;

    battleResults.forEach(result => {
      const playerData = result.players.find(p => p.userId.toString() === userId.toString());
      if (playerData) {
        totalBattles += 1;
        currentRating = playerData.ratingAfter;
        totalRatingChange += playerData.ratingChange;

        if (playerData.result === 'win') wins += 1;
        else if (playerData.result === 'loss') losses += 1;
        else if (playerData.result === 'draw') draws += 1;
      }
    });

    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalBattles,
        wins,
        losses,
        draws,
        winRate,
        currentRating,
        totalRatingChange
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Get user's recent battles
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const battleResults = await BattleResult.find({
      'players.userId': userId
    })
    .populate('players.userId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const formattedResults = battleResults.map(result => {
      const userPlayer = result.players.find(p => p.userId._id.toString() === userId.toString());
      const opponent = result.players.find(p => p.userId._id.toString() !== userId.toString());

      return {
        id: result._id,
        battleId: result.battleId,
        result: userPlayer.result,
        ratingChange: userPlayer.ratingChange,
        ratingAfter: userPlayer.ratingAfter,
        opponent: {
          name: opponent.userName,
          rating: opponent.ratingBefore
        },
        problem: result.problem,
        duration: result.duration,
        completedAt: result.completedAt,
        battleType: result.battleType
      };
    });

    res.json({
      success: true,
      battles: formattedResults,
      pagination: {
        page,
        limit,
        hasMore: battleResults.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battle history'
    });
  }
});

// Get battle details
router.get('/:battleId', auth, async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    const battleResult = await BattleResult.findOne({ battleId })
      .populate('players.userId', 'name');

    if (!battleResult) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check if user participated in this battle
    const userParticipated = battleResult.players.some(p => p.userId._id.toString() === userId.toString());
    if (!userParticipated) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      battle: battleResult
    });

  } catch (error) {
    console.error('Error fetching battle details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battle details'
    });
  }
});

module.exports = router;
