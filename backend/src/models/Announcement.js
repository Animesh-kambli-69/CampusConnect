'use strict';

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Announcement body is required'],
      trim: true,
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['academic', 'placements', 'events', 'general'],
      default: 'general',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ collegeId: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
