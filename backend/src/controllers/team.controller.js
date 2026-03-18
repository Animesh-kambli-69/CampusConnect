'use strict';

const User = require('../models/User');

/**
 * GET /api/teams/match?skills=React,Node.js
 * Returns top 5 users in the same campus whose skills best match the requested skills.
 */
async function getTeamRecommendations(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const { skills } = req.query;

    if (!skills) {
      return res.status(400).json({ success: false, message: 'skills query parameter is required.' });
    }

    const requiredSkills = skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (requiredSkills.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide at least one skill.' });
    }

    // Fetch all campus users (excluding requesting user)
    const candidates = await User.find({
      collegeId,
      _id: { $ne: req.user._id },
      isSuspended: false,
    }).select('name avatarUrl branch year skills resumeData role');

    // Score each candidate
    function normalize(str) {
      return str.toLowerCase().replace(/[.\s_-]/g, '');
    }

    function skillsOverlap(userSkills, required) {
      const normalizedUser = userSkills.map(normalize);
      let matches = 0;
      for (const req of required) {
        const reqNorm = normalize(req);
        if (normalizedUser.some((s) => s.includes(reqNorm) || reqNorm.includes(s))) {
          matches++;
        }
      }
      return matches;
    }

    const scored = candidates
      .map((user) => {
        const allSkills = [
          ...(user.skills || []),
          ...(user.resumeData?.skills || []),
        ];
        const dedupedSkills = [...new Set(allSkills)];
        const matchCount = skillsOverlap(dedupedSkills, requiredSkills);
        const matchPercent = requiredSkills.length > 0
          ? Math.round((matchCount / requiredSkills.length) * 100)
          : 0;
        return { user, matchCount, matchPercent };
      })
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 5);

    const recommendations = scored.map(({ user, matchPercent }) => ({
      user: {
        _id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        branch: user.branch,
        year: user.year,
        skills: user.skills,
      },
      matchPercent,
    }));

    res.status(200).json({ success: true, count: recommendations.length, data: { recommendations } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getTeamRecommendations };
