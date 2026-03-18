'use strict';

const { validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { getIO } = require('../config/socket');

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
}

async function getAnnouncements(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    const announcements = await Announcement.find({ collegeId })
      .populate('createdBy', 'name avatarUrl role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: { announcements },
    });
  } catch (error) {
    next(error);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { title, body, category } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const announcement = await Announcement.create({
      title,
      body,
      category: category || 'general',
      createdBy: req.user._id,
      collegeId,
    });

    await announcement.populate('createdBy', 'name avatarUrl role');

    try {
      const io = getIO();
      io.to(`college:${collegeId}`).emit('announcement:new', { announcement });
    } catch {
      // Socket.io not available — degrade gracefully
    }

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully.',
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (announcement.collegeId.toString() !== collegeId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await announcement.deleteOne();
    res.status(200).json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
