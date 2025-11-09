const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDemoAccount = async (req, res) => {
  try {
    const demoEmail = 'demo@inturnx.com';
    const demoPassword = 'demo123';

    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash(demoPassword, 12);

      demoUser = new User({
        name: 'Demo User',
        email: demoEmail,
        password: hashedPassword,
        role: 'student',
        xp: 150,
        badges: ['First Login', 'Explorer'],
        skills: ['JavaScript', 'React']
      });

      await demoUser.save();
    }

    const token = jwt.sign({ userId: demoUser._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

    res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        xp: demoUser.xp,
        badges: demoUser.badges
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('completedCourses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        badges: user.badges,
        skills: user.skills,
        completedCourses: user.completedCourses,
        resumeLink: user.resumeLink
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, bio, skills, github, linkedin, portfolio, location, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        bio,
        skills,
        github,
        linkedin,
        portfolio,
        location,
        role
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
        portfolio: updatedUser.portfolio,
        location: updatedUser.location
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login, getProfile, createDemoAccount, updateProfile };