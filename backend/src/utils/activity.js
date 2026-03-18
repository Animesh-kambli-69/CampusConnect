'use strict';

const Activity = require('../models/Activity');
const { getIO } = require('../config/socket');

/**
 * Log a campus activity and broadcast it via Socket.io.
 * Runs safely — never throws, so callers can fire-and-forget via setImmediate.
 */
async function logActivity({ type, actor, meta, collegeId }) {
  try {
    const activity = await Activity.create({
      type,
      actorId: actor._id,
      actorName: actor.name,
      actorAvatar: actor.avatarUrl || null,
      meta: meta || {},
      collegeId,
    });

    try {
      const io = getIO();
      io.to(`college:${collegeId}`).emit('activity:new', { activity });
    } catch {
      // Socket.io not available — degrade gracefully
    }
  } catch (err) {
    console.error('[Activity] Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
