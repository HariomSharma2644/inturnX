const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { signup, login, getProfile, createDemoAccount, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', login);
router.post('/demo', createDemoAccount);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=github`);
  }
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=google`);
  }
);

router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=linkedin`);
  }
);

module.exports = router;
