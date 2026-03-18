'use strict';

const User = require('../models/User');
const Event = require('../models/Event');
const Resource = require('../models/Resource');

function campusId(req) {
  return req.user.collegeId?._id || req.user.collegeId;
}

async function getCampusAnalytics(req, res, next) {
  try {
    const cId = campusId(req);
    const [students, committee, events, resources, suspended] = await Promise.all([
      User.countDocuments({ collegeId: cId, role: 'student' }),
      User.countDocuments({ collegeId: cId, role: 'committee' }),
      Event.countDocuments({ collegeId: cId }),
      Resource.countDocuments({ campusId: cId }),
      User.countDocuments({ collegeId: cId, isSuspended: true }),
    ]);

    res.status(200).json({
      success: true,
      data: { analytics: { students, committee, events, resources, suspended } },
    });
  } catch (error) {
    next(error);
  }
}

async function getCampusUsers(req, res, next) {
  try {
    const cId = campusId(req);
    const { search, role } = req.query;

    const filter = {
      collegeId: cId,
      role: { $nin: ['campusAdmin', 'superAdmin'] },
    };
    if (role && ['student', 'committee'].includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

async function changeUserRole(req, res, next) {
  try {
    const cId = campusId(req);
    const { role } = req.body;

    if (!['student', 'committee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or committee.' });
    }

    const user = await User.findOne({ _id: req.params.id, collegeId: cId }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in your campus.' });
    }
    if (['campusAdmin', 'superAdmin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot change the role of an admin.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: 'Role updated.', data: { user } });
  } catch (error) {
    next(error);
  }
}

async function toggleSuspend(req, res, next) {
  try {
    const cId = campusId(req);
    const user = await User.findOne({ _id: req.params.id, collegeId: cId }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in your campus.' });
    }
    if (['campusAdmin', 'superAdmin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot suspend an admin.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCampusAnalytics, getCampusUsers, changeUserRole, toggleSuspend };
