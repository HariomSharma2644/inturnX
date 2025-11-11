const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'cpp', 'java', 'c', 'go', 'kotlin', 'rust', 'typescript', 'swift']
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  questionId: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['mcq', 'output_prediction', 'short_code', 'full_problem']
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  executionResult: {
    stdout: String,
    stderr: String,
    compile_output: String,
    status: {
      id: Number,
      description: String
    },
    time: String,
    memory: Number
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  lifelineUsed: {
    type: String,
    enum: ['fifty_fifty', 'hint', 'skip', null],
    default: null
  },
  score: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
quizSubmissionSchema.index({ userId: 1, language: 1, level: 1 });
quizSubmissionSchema.index({ submittedAt: -1 });
quizSubmissionSchema.index({ language: 1, level: 1, isCorrect: 1 });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
