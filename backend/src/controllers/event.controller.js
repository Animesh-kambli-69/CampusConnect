'use strict';

const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../config/socket');
const { logActivity } = require('../utils/activity');

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

/**
 * GET /api/events
 * Return all events for the current user's college, newest first.
 */
async function getEvents(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const events = await Event.find({ collegeId })
      .populate('organizer', 'name avatarUrl role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: { events },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events
 * Committee head creates a new event → notifies all college users in real-time.
 */
async function createEvent(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { title, description, date, venue, category, meetLink, customCategory } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    // Banner image uploaded via multer → Cloudinary; falls back to null if not provided
    const imageUrl = req.file?.path || null;

    // 1. Create the event
    const event = await Event.create({
      title,
      description,
      date,
      venue,
      category: category || 'other',
      customCategory: category === 'other' && customCategory?.trim() ? customCategory.trim() : null,
      meetLink: meetLink?.trim() || null,
      imageUrl: imageUrl || null,
      organizer: req.user._id,
      collegeId,
    });

    await event.populate('organizer', 'name avatarUrl role');

    // 2. Find all college users except the organizer
    const collegeUsers = await User.find({
      collegeId,
      _id: { $ne: req.user._id },
    }).select('_id');

    // 3. Bulk-create notifications
    const notificationMessage = `📅 New event: "${title}" by ${req.user.name}`;
    if (collegeUsers.length > 0) {
      await Notification.insertMany(
        collegeUsers.map((u) => ({
          userId: u._id,
          eventId: event._id,
          message: notificationMessage,
          read: false,
        }))
      );
    }

    // 4. Emit real-time event to college room
    try {
      const io = getIO();
      io.to(`college:${collegeId}`).emit('new_event', {
        event,
        message: notificationMessage,
      });
    } catch {
      // Socket.io not available — degrade gracefully (notifications still saved)
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: { event },
    });

    setImmediate(() => {
      logActivity({
        type: 'event:created',
        actor: req.user,
        meta: { eventId: event._id, title: event.title },
        collegeId,
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events/:id
 * Return a single event by ID.
 */
async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name avatarUrl role'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events/:id/attendance/open
 * Organizer opens attendance — generates a one-time token.
 */
async function openAttendance(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the organizer can manage attendance.' });
    }

    event.attendanceToken = crypto.randomBytes(16).toString('hex');
    event.attendanceOpen = true;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Attendance opened.',
      data: { token: event.attendanceToken, eventId: event._id },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events/:id/attendance/close
 * Organizer closes attendance.
 */
async function closeAttendance(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the organizer can manage attendance.' });
    }

    event.attendanceOpen = false;
    await event.save();

    res.status(200).json({ success: true, message: 'Attendance closed.' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/events/:id/attendance/mark
 * Student marks their attendance using the token.
 */
async function markAttendance(req, res, next) {
  try {
    const { token } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!event.attendanceOpen) {
      return res.status(400).json({ success: false, message: 'Attendance is not open for this event.' });
    }
    if (event.attendanceToken !== token) {
      return res.status(400).json({ success: false, message: 'Invalid attendance token.' });
    }

    const alreadyMarked = event.attendees.some(
      (a) => a.userId.toString() === req.user._id.toString()
    );
    if (alreadyMarked) {
      return res.status(200).json({ success: true, message: 'Attendance already marked.', alreadyMarked: true });
    }

    event.attendees.push({ userId: req.user._id, name: req.user.name });
    await event.save();

    res.status(200).json({ success: true, message: 'Attendance marked successfully!' });

    // Award points for attending
    setImmediate(async () => {
      try {
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });
      } catch { /* ignore */ }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events/:id/attendance
 * Organizer fetches the attendee list.
 */
async function getAttendees(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).select('organizer attendees attendanceOpen');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the organizer can view attendees.' });
    }

    res.status(200).json({
      success: true,
      count: event.attendees.length,
      data: { attendees: event.attendees, attendanceOpen: event.attendanceOpen },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEvents, createEvent, getEventById, openAttendance, closeAttendance, markAttendance, getAttendees };
