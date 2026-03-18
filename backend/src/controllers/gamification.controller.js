'use strict';

const User = require('../models/User');
const Resource = require('../models/Resource');
const Event = require('../models/Event');
const Project = require('../models/Project');

// GET /api/leaderboard
async function getLeaderboard(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const topUsers = await User.find({ collegeId, isSuspended: false })
      .select('name avatarUrl branch year points badges role')
      .sort({ points: -1 })
      .limit(20);

    // Get current user rank
    const myPoints = req.user.points || 0;
    const rank = await User.countDocuments({
      collegeId,
      isSuspended: false,
      points: { $gt: myPoints },
    });

    res.status(200).json({
      success: true,
      data: { leaderboard: topUsers, myRank: rank + 1 },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/leaderboard/me  — detailed stats for current user
async function getMyStats(req, res, next) {
  try {
    const userId = req.user._id;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const [resourceCount, eventCount, projectCount] = await Promise.all([
      Resource.countDocuments({ uploadedBy: userId }),
      Event.countDocuments({ attendees: { $elemMatch: { userId } } }),
      Project.countDocuments({ createdBy: userId }),
    ]);

    const user = await User.findById(userId).select('points badges name avatarUrl');

    res.status(200).json({
      success: true,
      data: {
        points: user.points || 0,
        badges: user.badges || [],
        resourceCount,
        eventCount,
        projectCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getLeaderboard, getMyStats };
