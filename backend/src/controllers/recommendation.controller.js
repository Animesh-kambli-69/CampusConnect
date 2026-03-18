'use strict';

const User = require('../models/User');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
const Project = require('../models/Project');

/**
 * GET /api/recommendations
 * Returns personalized recommendations for the current user:
 *  - recommended events (based on user skills)
 *  - recommended teammates (complementary skills)
 *  - recommended resources (based on semester/branch)
 */
async function getRecommendations(req, res, next) {
  try {
    const user = req.user;
    const collegeId = user.collegeId?._id || user.collegeId;
    const userSkills = new Set([
      ...(user.skills || []).map((s) => s.toLowerCase()),
      ...(user.resumeData?.skills || []).map((s) => s.toLowerCase()),
    ]);

    // ── 1. Recommended Events ─────────────────────────────────────────────
    const upcomingEvents = await Event.find({
      collegeId,
      date: { $gte: new Date() },
    })
      .populate('organizer', 'name avatarUrl')
      .sort({ date: 1 })
      .limit(10);

    const recommendedEvents = upcomingEvents.slice(0, 3);

    // ── 2. Recommended Resources ──────────────────────────────────────────
    const resourceFilter = { campusId: collegeId };
    if (user.branch) resourceFilter.branch = { $regex: user.branch, $options: 'i' };

    const recommendedResources = await Resource.find(resourceFilter)
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(3);

    // ── 3. Suggested Teammates ────────────────────────────────────────────
    // Find users with skills that complement (differ from) what you already have
    const allCampusUsers = await User.find({
      collegeId,
      _id: { $ne: user._id },
      isSuspended: false,
    })
      .select('name avatarUrl branch year skills')
      .limit(50);

    const suggestedTeammates = allCampusUsers
      .filter((u) => {
        if (userSkills.size === 0) return true;
        const theirSkills = (u.skills || []).map((s) => s.toLowerCase());
        return theirSkills.some((s) => !userSkills.has(s));
      })
      .slice(0, 3);

    res.status(200).json({
      success: true,
      data: {
        events: recommendedEvents,
        resources: recommendedResources,
        teammates: suggestedTeammates,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getRecommendations };
