'use strict';

const mongoose = require('mongoose');

const jobOpportunitySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: { values: ['on_campus', 'off_campus', 'internship', 'freelance'], message: 'Invalid type' },
      default: 'off_campus',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    applyLink: { type: String, trim: true, default: null },
    deadline: { type: Date, default: null },
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

jobOpportunitySchema.index({ collegeId: 1, createdAt: -1 });
jobOpportunitySchema.index({ collegeId: 1, deadline: 1 });

module.exports = mongoose.model('JobOpportunity', jobOpportunitySchema);
