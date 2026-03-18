'use strict';

const { validationResult } = require('express-validator');
const StudyRoom = require('../models/StudyRoom');
const User = require('../models/User');
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

async function getStudyRooms(req, res, next) {
  try {
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const rooms = await StudyRoom.find({ collegeId, isActive: true })
      .populate('createdBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, count: rooms.length, data: { rooms } });
  } catch (error) {
    next(error);
  }
}

async function getStudyRoomById(req, res, next) {
  try {
    const room = await StudyRoom.findById(req.params.id)
      .populate('createdBy', 'name avatarUrl');

    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (room.collegeId.toString() !== collegeId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
}

async function createStudyRoom(req, res, next) {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, subject, goal, focusDuration, breakDuration } = req.body;
    const collegeId = req.user.collegeId?._id || req.user.collegeId;

    const room = await StudyRoom.create({
      name,
      subject: subject || '',
      goal: goal || '',
      focusDuration: focusDuration || 25,
      breakDuration: breakDuration || 5,
      members: [{
        userId: req.user._id,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
      }],
      createdBy: req.user._id,
      collegeId,
    });

    await room.populate('createdBy', 'name avatarUrl');

    try {
      const io = getIO();
      io.to(`college:${collegeId}`).emit('studyroom:new', { room });
    } catch {
      // degrade gracefully
    }

    res.status(201).json({ success: true, message: 'Study room created.', data: { room } });
  } catch (error) {
    next(error);
  }
}

async function joinStudyRoom(req, res, next) {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (!room.isActive) return res.status(400).json({ success: false, message: 'Room is closed.' });

    const alreadyMember = room.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      room.members.push({
        userId: req.user._id,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
      });
      await room.save();
    }

    try {
      const io = getIO();
      io.to(`studyroom:${room._id}`).emit('studyroom:member_joined', {
        roomId: room._id,
        user: { _id: req.user._id, name: req.user.name, avatarUrl: req.user.avatarUrl },
      });
    } catch {
      // degrade gracefully
    }

    res.status(200).json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
}

async function leaveStudyRoom(req, res, next) {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    room.members = room.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );

    // Close room if creator leaves and no one remains
    if (
      room.members.length === 0 ||
      room.createdBy.toString() === req.user._id.toString()
    ) {
      room.isActive = false;
    }

    await room.save();

    try {
      const io = getIO();
      io.to(`studyroom:${room._id}`).emit('studyroom:member_left', {
        roomId: room._id,
        userId: req.user._id,
      });
    } catch {
      // degrade gracefully
    }

    res.status(200).json({ success: true, message: 'Left room.' });
  } catch (error) {
    next(error);
  }
}

async function controlTimer(req, res, next) {
  try {
    const { action } = req.params; // start | pause | reset | next_phase
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (room.collegeId.toString() !== collegeId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const now = new Date();

    if (action === 'start') {
      if (!room.timerState.isRunning) {
        room.timerState.isRunning = true;
        room.timerState.startedAt = now;
      }
    } else if (action === 'pause') {
      if (room.timerState.isRunning && room.timerState.startedAt) {
        const secondsRunning = Math.floor((now - room.timerState.startedAt) / 1000);
        room.timerState.elapsed += secondsRunning;
        room.timerState.isRunning = false;
        room.timerState.startedAt = null;
      }
    } else if (action === 'reset') {
      room.timerState = {
        isRunning: false,
        phase: 'focus',
        startedAt: null,
        elapsed: 0,
      };
    } else if (action === 'next_phase') {
      room.timerState = {
        isRunning: false,
        phase: room.timerState.phase === 'focus' ? 'break' : 'focus',
        startedAt: null,
        elapsed: 0,
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    await room.save();

    try {
      const io = getIO();
      io.to(`studyroom:${room._id}`).emit('studyroom:timer_update', {
        roomId: room._id,
        timerState: room.timerState,
      });
    } catch {
      // degrade gracefully
    }

    res.status(200).json({ success: true, data: { timerState: room.timerState } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudyRooms,
  getStudyRoomById,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  controlTimer,
};
