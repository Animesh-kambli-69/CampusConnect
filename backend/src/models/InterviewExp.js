'use strict';

const mongoose = require('mongoose');

const interviewExpSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [200, 'Role cannot exceed 200 characters'],
    },
    rounds: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: { values: ['easy', 'medium', 'hard'], message: 'Invalid difficulty' },
      default: 'medium',
    },
    outcome: {
      type: String,
      enum: { values: ['selected', 'rejected', 'pending'], message: 'Invalid outcome' },
      default: 'pending',
    },
    year: { type: Number },
    experience: {
      type: String,
      required: [true, 'Experience details are required'],
      trim: true,
      maxlength: [5000, 'Experience cannot exceed 5000 characters'],
    },
    tips: {
      type: String,
      trim: true,
      maxlength: [2000, 'Tips cannot exceed 2000 characters'],
      default: '',
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
  },
  { timestamps: true }
);

interviewExpSchema.index({ collegeId: 1, createdAt: -1 });
interviewExpSchema.index({ collegeId: 1, company: 1 });

module.exports = mongoose.model('InterviewExp', interviewExpSchema);
