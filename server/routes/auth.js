const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { signup, login, getProfile, createDemoAccount, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
router.put('/profile', auth, uploadResume.single('resume'), updateProfile);

// OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    // For Railway-only deployment: use relative path
    // For separate deployments: use CLIENT_URL
    const redirectUrl = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=github`
      : `/auth/callback?token=${token}&provider=github`;
    res.redirect(redirectUrl);
  }
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    const redirectUrl = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=google`
      : `/auth/callback?token=${token}&provider=google`;
    res.redirect(redirectUrl);
  }
);

router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
    const redirectUrl = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=linkedin`
      : `/auth/callback?token=${token}&provider=linkedin`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
