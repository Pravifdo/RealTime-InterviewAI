const mongoose = require('mongoose');

const QuestionAnswerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  expectedKeywords: [{
    type: String
  }],
  participantAnswer: {
    type: String,
    default: ''
  },
  extractedKeywords: [{
    type: String
  }],
  matchedKeywords: [{
    type: String
  }],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const EvaluationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participantName: {
    type: String
  },
  roomId: {
    type: String,
    required: true
  },
  questionsAnswers: [QuestionAnswerSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate average score
EvaluationSchema.methods.calculateAverage = function() {
  if (this.questionsAnswers.length === 0) {
    this.averageScore = 0;
  } else {
    const total = this.questionsAnswers.reduce((sum, qa) => sum + qa.score, 0);
    this.averageScore = Math.round((total / this.questionsAnswers.length) * 100) / 100;
  }
  this.totalScore = this.averageScore;
  this.totalQuestions = this.questionsAnswers.length;
  return this.averageScore;
};

module.exports = mongoose.model('Evaluation', EvaluationSchema);