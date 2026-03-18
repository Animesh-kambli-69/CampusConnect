'use strict';

const express = require('express');
const { body } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcement.controller');

const router = express.Router();

const createValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('body').trim().notEmpty().withMessage('Body is required')
    .isLength({ max: 5000 }).withMessage('Body cannot exceed 5000 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'placements', 'events', 'general'])
    .withMessage('Invalid category'),
];

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', restrictTo('committee', 'campusAdmin', 'superAdmin'), createValidator, createAnnouncement);
router.delete('/:id', restrictTo('committee', 'campusAdmin', 'superAdmin'), deleteAnnouncement);

module.exports = router;
