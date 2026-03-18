'use strict';

const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: { values: ['lost', 'found'], message: 'Type must be lost or found' },
      required: [true, 'Type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    imageUrl: { type: String, default: null },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: { values: ['open', 'resolved'], message: 'Invalid status' },
      default: 'open',
    },
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

lostFoundSchema.index({ collegeId: 1, createdAt: -1 });
lostFoundSchema.index({ collegeId: 1, status: 1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);
