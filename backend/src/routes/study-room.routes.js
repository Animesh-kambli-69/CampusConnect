'use strict';

const { body } = require('express-validator');
const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getStudyRooms,
  getStudyRoomById,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  controlTimer,
} = require('../controllers/study-room.controller');

const router = express.Router();
router.use(protect);

const createValidators = [
  body('name').trim().notEmpty().withMessage('Room name is required').isLength({ max: 100 }),
];

router.get('/', getStudyRooms);
router.post('/', createValidators, createStudyRoom);
router.get('/:id', getStudyRoomById);
router.post('/:id/join', joinStudyRoom);
router.post('/:id/leave', leaveStudyRoom);
router.post('/:id/timer/:action', controlTimer);

module.exports = router;
