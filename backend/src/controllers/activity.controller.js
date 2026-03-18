'use strict';

const Activity = require('../models/Activity');

async function getActivity(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const activities = await Activity.find({ collegeId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getActivity };
