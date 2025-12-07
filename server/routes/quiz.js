const express = require('express');
const router = express.Router();
const QuizProgress = require('../models/QuizProgress');
const QuizSubmission = require('../models/QuizSubmission');
const { QUIZ_BANK, LANGUAGES, getLevelsForLanguage, getQuestionsForLevel } = require('../data/quizBank');
const { auth } = require('../middleware/auth');

// Get quiz question for specific language and level
router.get('/:language/:level', auth, async (req, res) => {
  try {
    const { language, level } = req.params;
    const levelNum = parseInt(level);

    if (!LANGUAGES.find(l => l.key === language)) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    if (levelNum < 1 || levelNum > 100) {
      return res.status(400).json({ message: 'Invalid level' });
    }

    // Check user progress
    let progress = await QuizProgress.findOne({
      userId: req.user.id,
      language
    });

    if (!progress) {
      progress = new QuizProgress({
        userId: req.user.id,
        language,
        currentLevel: 1,
        completedLevels: 0
      });
      await progress.save();
    }

    // Check if level is unlocked
    if (levelNum > progress.completedLevels + 1) {
      return res.status(403).json({ message: 'Level not unlocked yet' });
    }

    // Get question from quiz bank (with dynamic generation fallback)
    const levelQuestions = getQuestionsForLevel(language, levelNum);
    if (!levelQuestions || levelQuestions.length === 0) {
      return res.status(404).json({ message: 'Questions not available for this level' });
    }

    // Filter out solved questions
    const unsolvedQuestions = levelQuestions.filter(q => !progress.solvedQuestions.includes(q.id));

    if (unsolvedQuestions.length === 0) {
      // All questions for this level are solved, advance the user
      if (levelNum > progress.completedLevels) {
        progress.completedLevels = levelNum;
        progress.currentLevel = Math.min(100, levelNum + 1);
        await progress.save();
      }
      return res.status(200).json({ message: 'Level complete! Moving to next level.', levelComplete: true });
    }

    const question = unsolvedQuestions[0];

    // Determine question type based on level
    let questionType = 'mcq';
    if (levelNum >= 31 && levelNum <= 60) {
      questionType = 'output_prediction';
    } else if (levelNum >= 61 && levelNum <= 85) {
      questionType = 'short_code';
    } else if (levelNum >= 86) {
      questionType = 'full_problem';
    }

    res.json({
      question: {
        ...question,
        level: levelNum,
        language
      },
      progress: {
        currentLevel: progress.currentLevel,
        completedLevels: progress.completedLevels,
        coins: progress.coins,
        lifelinesUsed: progress.lifelinesUsed,
        solvedQuestions: progress.solvedQuestions
      }
    });

  } catch (error) {
    console.error('Get quiz question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answer
router.post('/submit', auth, async (req, res) => {
  try {
    const { language, level, questionId, answer, timeTaken, lifelineUsed, code } = req.body;

    // Validate input
    if (!language || !level || !questionId || answer === undefined || timeTaken === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get question from quiz bank to check answer
    const levelQuestions = QUIZ_BANK[language]?.[level];
    if (!levelQuestions) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = levelQuestions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Determine question type based on level
    let questionType = 'mcq';
    if (level >= 31 && level <= 60) {
      questionType = 'output_prediction';
    } else if (level >= 61 && level <= 85) {
      questionType = 'short_code';
    } else if (level >= 86) {
      questionType = 'full_problem';
    }

    // Check answer
    let isCorrect = false;
    if (questionType === 'mcq') {
      isCorrect = parseInt(answer, 10) === question.answerIndex;
    } else if (questionType === 'output_prediction') {
      // For output prediction, compare strings (case insensitive, trimmed)
      isCorrect = answer.toString().toLowerCase().trim() === question.expectedOutput?.toLowerCase().trim();
    } else if (questionType === 'short_code' || questionType === 'full_problem') {
      // For coding questions, simplified check: correct if code is provided
      isCorrect = code && code.trim().length > 0;
    }

    // Calculate score based on correctness, time, and level
    let score = 0;
    if (isCorrect) {
      const baseScore = level * 10;
      const timeBonus = Math.max(0, 60 - timeTaken) * 2; // Bonus for quick answers
      score = baseScore + timeBonus;
    }

    // Create submission record
    const submission = new QuizSubmission({
      userId: req.user.id,
      language,
      level,
      questionId,
      questionType: question.type || 'mcq',
      answer,
      isCorrect,
      timeTaken,
      code: code || '',
      lifelineUsed,
      score
    });

    await submission.save();

    // Update user progress
    let progress = await QuizProgress.findOne({
      userId: req.user.id,
      language
    });

    if (!progress) {
      progress = new QuizProgress({
        userId: req.user.id,
        language
      });
    }

    // Update scores and stats
    progress.scores.set(level.toString(), (progress.scores.get(level.toString()) || 0) + score);
    progress.totalScore += score;

    if (isCorrect) {
      progress.accuracy = ((progress.accuracy * progress.completedLevels) + 100) / (progress.completedLevels + 1);
    } else {
      progress.accuracy = (progress.accuracy * progress.completedLevels) / (progress.completedLevels + 1);
    }

    // Update average time
    const totalSubmissions = await QuizSubmission.countDocuments({
      userId: req.user.id,
      language
    });
    const totalTime = await QuizSubmission.aggregate([
      { $match: { userId: req.user.id, language } },
      { $group: { _id: null, totalTime: { $sum: '$timeTaken' } } }
    ]);
    progress.averageTime = totalTime[0]?.totalTime / totalSubmissions || 0;

    // Update lifelines used
    if (lifelineUsed) {
      progress.lifelinesUsed[lifelineUsed] = (progress.lifelinesUsed[lifelineUsed] || 0) + 1;
      progress.coins = Math.max(0, progress.coins - 10); // Deduct coins for lifeline
    }

    if (isCorrect) {
      if (!progress.solvedQuestions.includes(questionId)) {
        progress.solvedQuestions.push(questionId);
      }
    }

    // Check if level completed
    if (isCorrect && level > progress.completedLevels) {
      progress.completedLevels = level;
      progress.currentLevel = Math.min(100, level + 1);

      // Award coins for completing level
      progress.coins += level * 5;

      // Check for badges
      if (level === 10) progress.badges.push('level_10');
      if (level === 25) progress.badges.push('level_25');
      if (level === 50) progress.badges.push('level_50');
      if (level === 100) {
        progress.badges.push('level_100');
      }
    }

    progress.lastPlayed = new Date();
    await progress.save();

    res.json({
      isCorrect,
      score,
      explanation: question.explanation,
      codeExample: question.codeExample,
      progress: {
        currentLevel: progress.currentLevel,
        completedLevels: progress.completedLevels,
        coins: progress.coins,
        totalScore: progress.totalScore
      }
    });

  } catch (error) {
    console.error('Submit quiz answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress for a language
router.get('/progress/:language', auth, async (req, res) => {
  try {
    const { language } = req.params;

    const progress = await QuizProgress.findOne({
      userId: req.user.id,
      language
    });

    if (!progress) {
      return res.json({
        currentLevel: 1,
        completedLevels: 0,
        scores: {},
        totalScore: 0,
        accuracy: 0,
        averageTime: 0,
        coins: 100,
        badges: [],
        lifelinesUsed: { fiftyFifty: 0, hint: 0, skip: 0 },
        solvedQuestions: []
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Use lifeline
router.post('/lifeline', auth, async (req, res) => {
  try {
    const { language, lifelineType } = req.body;

    const progress = await QuizProgress.findOne({
      userId: req.user.id,
      language
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    if (progress.coins < 10) {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    // Deduct coins
    progress.coins -= 10;
    progress.lifelinesUsed[lifelineType] = (progress.lifelinesUsed[lifelineType] || 0) + 1;
    await progress.save();

    res.json({
      success: true,
      coins: progress.coins,
      lifelineUsed: lifelineType
    });

  } catch (error) {
    console.error('Use lifeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get certificate for completed quiz
router.get('/certificate/:language', auth, async (req, res) => {
  try {
    const { language } = req.params;

    const progress = await QuizProgress.findOne({
      userId: req.user.id,
      language,
      completedLevels: 100
    });

    if (!progress) {
      return res.status(404).json({ message: 'Certificate not available' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    res.json({
      userName: user.username,
      language: language.charAt(0).toUpperCase() + language.slice(1),
      totalScore: progress.totalScore,
      accuracy: Math.round(progress.accuracy),
      averageTime: Math.round(progress.averageTime),
      completedDate: progress.lastPlayed.toISOString().split('T')[0],
      certificateId: `QUIZ-${language}-${req.user.id}-${Date.now()}`
    });

  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download certificate as PDF
router.get('/certificate/:language/download', auth, async (req, res) => {
  try {
    const { language } = req.params;

    const progress = await QuizProgress.findOne({
      userId: req.user.id,
      language,
      completedLevels: 100
    });

    if (!progress) {
      return res.status(404).json({ message: 'Certificate not available' });
    }

    // For now, return a simple text response
    // In production, you'd generate a proper PDF
    const certificateText = `
InturnX Programming Quiz Arena Certificate

This certifies that ${req.user.username} has successfully completed
all 100 levels of the ${language.toUpperCase()} Programming Challenge.

Total Score: ${progress.totalScore}
Accuracy: ${Math.round(progress.accuracy)}%
Average Time: ${Math.round(progress.averageTime)} seconds

Completed on: ${progress.lastPlayed.toISOString().split('T')[0]}

Certificate ID: QUIZ-${language}-${req.user.id}-${Date.now()}
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="InturnX-${language}-Certificate.txt"`);
    res.send(certificateText);

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
