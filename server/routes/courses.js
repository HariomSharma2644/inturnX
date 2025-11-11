const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all courses with progress for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ category: 1, order: 1 });
    const userId = req.user.id;

    // Get progress for each course
    const progressPromises = courses.map(async (course) => {
      const progress = await Progress.findOne({ user: userId, course: course._id });
      return {
        course: course,
        progress: progress ? {
          percentage: progress.percentage,
          status: progress.status,
          completedAt: progress.completedAt
        } : null
      };
    });

    const coursesWithProgress = await Promise.all(progressPromises);

    // Group by category (learning paths)
    const learningPaths = {};
    coursesWithProgress.forEach(({ course, progress }) => {
      if (!learningPaths[course.category]) {
        learningPaths[course.category] = [];
      }
      learningPaths[course.category].push({
        ...course.toObject(),
        progress: progress || { percentage: 0, status: 'not-started' }
      });
    });

    res.json({ learningPaths });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID with detailed progress
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.id
    }).populate('course');

    // Check if course is unlocked (prerequisites completed)
    let isUnlocked = true;
    if (course.prerequisites && course.prerequisites.length > 0) {
      for (const prereqId of course.prerequisites) {
        const prereqProgress = await Progress.findOne({
          user: req.user.id,
          course: prereqId,
          status: 'completed'
        });
        if (!prereqProgress) {
          isUnlocked = false;
          break;
        }
      }
    }

    res.json({
      course,
      progress: progress || { percentage: 0, status: 'not-started' },
      isUnlocked
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course progress
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { moduleIndex, completed, score, timeSpent } = req.body;
    const userId = req.user.id;
    const courseId = req.params.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      progress = new Progress({
        user: userId,
        course: courseId,
        status: 'in-progress'
      });
    }

    // Update completed modules
    if (completed && moduleIndex !== undefined) {
      const existingModule = progress.completedModules.find(m => m.moduleIndex === moduleIndex);
      if (!existingModule) {
        progress.completedModules.push({
          moduleIndex,
          completedAt: new Date(),
          score: score || 0
        });
        progress.xpEarned += 10; // XP per module
      }
    }

    // Update time spent
    if (timeSpent) {
      progress.timeSpent += timeSpent;
    }

    // Calculate percentage
    const course = await Course.findById(courseId);
    if (course && course.modules.length > 0) {
      progress.percentage = Math.round((progress.completedModules.length / course.modules.length) * 100);
    }

    // Check if course is completed
    if (progress.percentage === 100 && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
      progress.xpEarned += course.xpReward;

      // Update user XP and completed courses
      await User.findByIdAndUpdate(userId, {
        $inc: { xp: course.xpReward },
        $push: { completedCourses: courseId }
      });
    }

    await progress.save();

    res.json({
      message: 'Progress updated successfully',
      progress: {
        percentage: progress.percentage,
        status: progress.status,
        xpEarned: progress.xpEarned
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate certificate for completed course
router.post('/:id/certificate', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const progress = await Progress.findOne({
      user: userId,
      course: courseId,
      status: 'completed'
    });

    if (!progress) {
      return res.status(400).json({ message: 'Course not completed' });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ user: userId, course: courseId });
    if (existingCert) {
      return res.json({ certificate: existingCert });
    }

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    // Generate certificate ID
    const certificateId = `INTURNX-${courseId}-${userId}-${Date.now()}`;

    const certificate = new Certificate({
      user: userId,
      course: courseId,
      title: course.certificate,
      description: `Certificate of completion for ${course.title}`,
      certificateId,
      imageUrl: `/certificates/${certificateId}.png`, // Placeholder
      verificationUrl: `/verify/${certificateId}`,
      skills: course.content.split(', '),
      xpEarned: progress.xpEarned
    });

    await certificate.save();

    // Update user certificates
    await User.findByIdAndUpdate(userId, {
      $push: { certificates: certificate._id }
    });

    res.status(201).json({ certificate });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new course (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // TODO: Add admin check
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
