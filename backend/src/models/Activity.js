'use strict';

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['resource:uploaded', 'event:created', 'connection:made', 'team:created', 'project:created'],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: { type: String, required: true },
    actorAvatar: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ collegeId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
