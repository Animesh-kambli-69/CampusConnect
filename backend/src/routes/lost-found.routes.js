'use strict';

const { body } = require('express-validator');
const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { uploadImage } = require('../config/cloudinary');
const {
  getLostFoundItems,
  createLostFoundItem,
  resolveLostFoundItem,
  deleteLostFoundItem,
} = require('../controllers/lost-found.controller');

const router = express.Router();
router.use(protect);

const createValidators = [
  body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('title').trim().notEmpty().withMessage('Title is required'),
];

router.get('/', getLostFoundItems);
router.post('/', uploadImage.single('image'), createValidators, createLostFoundItem);
router.patch('/:id/resolve', resolveLostFoundItem);
router.delete('/:id', deleteLostFoundItem);

module.exports = router;
