const mongoose = require('mongoose');

const QuestionTemplateSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  expectedKeywords: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  order: {
    type: Number,
    default: 0
  }
});

const InterviewTemplateSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  interviewerName: {
    type: String
  },
  title: {
    type: String,
    default: 'Technical Interview'
  },
  questions: [QuestionTemplateSchema],
  status: {
    type: String,
    enum: ['draft', 'ready', 'in-progress', 'completed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-update the updatedAt field
InterviewTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InterviewTemplate', InterviewTemplateSchema);
