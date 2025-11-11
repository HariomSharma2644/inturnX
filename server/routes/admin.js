const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Internship = require('../models/Internship');
const Project = require('../models/Project');

const router = express.Router();

// All admin routes require admin role
router.use(auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/users/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Create course
router.post('/courses', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

// Get all internships
router.get('/internships', async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json({ internships });
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({ message: 'Failed to fetch internships' });
  }
});

// Create internship
router.post('/internships', async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json({ internship });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ message: 'Failed to create internship' });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get companies (mock data for now)
router.get('/companies', async (req, res) => {
  try {
    // Mock companies data - in real app, this would be a Company model
    const companies = [
      {
        _id: '1',
        name: 'Google',
        description: 'Technology company that specializes in Internet-related services and products.',
        industry: 'Technology',
        website: 'https://google.com'
      },
      {
        _id: '2',
        name: 'Microsoft',
        description: 'American multinational technology corporation.',
        industry: 'Technology',
        website: 'https://microsoft.com'
      },
      {
        _id: '3',
        name: 'Amazon',
        description: 'American multinational technology company.',
        industry: 'E-commerce',
        website: 'https://amazon.com'
      }
    ];

    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// Create company (mock implementation)
router.post('/companies', async (req, res) => {
  try {
    // Mock company creation - in real app, this would save to database
    const company = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };

    res.status(201).json({ company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Failed to create company' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalInternships,
      totalProjects
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Internship.countDocuments(),
      Project.countDocuments()
    ]);

    res.json({
      stats: {
        totalUsers,
        totalCourses,
        totalInternships,
        totalProjects,
        activeUsers: totalUsers // Simplified for now
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;