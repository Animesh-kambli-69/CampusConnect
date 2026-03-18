'use strict';

const mongoose = require('mongoose');

const studyRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters'],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
      default: '',
    },
    goal: {
      type: String,
      trim: true,
      maxlength: [300, 'Goal cannot exceed 300 characters'],
      default: '',
    },
    focusDuration: { type: Number, default: 25 },  // minutes
    breakDuration: { type: Number, default: 5 },   // minutes
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        avatarUrl: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    timerState: {
      isRunning: { type: Boolean, default: false },
      phase: { type: String, enum: ['focus', 'break'], default: 'focus' },
      startedAt: { type: Date, default: null },
      elapsed: { type: Number, default: 0 }, // seconds already elapsed before last start
    },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
  },
  { timestamps: true }
);

studyRoomSchema.index({ collegeId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
