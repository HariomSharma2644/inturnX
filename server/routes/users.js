const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Progress = require('../models/Progress');
const Project = require('../models/Project');
const BattleResult = require('../models/BattleResult');
const moment = require('moment');

router.get('/recent-activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const completedCourses = await Progress.find({ user: userId, status: 'completed' })
      .populate('course', 'title')
      .sort({ completedAt: -1 })
      .limit(5);

    const submittedProjects = await Project.find({ user: userId })
      .sort({ submittedAt: -1 })
      .limit(5);

    const wonBattles = await BattleResult.find({ winner: userId })
      .populate('battle', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const activities = [
      ...completedCourses.map(c => ({
        id: c._id,
        type: 'course',
        title: `Completed ${c.course.title}`,
        time: moment(c.completedAt).fromNow(),
        icon: '📚'
      })),
      ...submittedProjects.map(p => ({
        id: p._id,
        type: 'project',
        title: `Submitted ${p.title}`,
        time: moment(p.submittedAt).fromNow(),
        icon: '🚀'
      })),
      ...wonBattles.map(b => ({
        id: b._id,
        type: 'battle',
        title: `Won coding battle in ${b.battle.title}`,
        time: moment(b.createdAt).fromNow(),
        icon: '⚔️'
      }))
    ];

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ activities: activities.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
