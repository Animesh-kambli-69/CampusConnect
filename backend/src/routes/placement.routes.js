'use strict';

const { body } = require('express-validator');
const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getInterviewExps,
  createInterviewExp,
  deleteInterviewExp,
  upvoteInterviewExp,
  getOpportunities,
  createOpportunity,
  deleteOpportunity,
} = require('../controllers/placement.controller');

const router = express.Router();
router.use(protect);

const expValidators = [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('experience').trim().notEmpty().withMessage('Experience details are required'),
];

const oppValidators = [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
];

// Interview Experiences
router.get('/interviews', getInterviewExps);
router.post('/interviews', expValidators, createInterviewExp);
router.delete('/interviews/:id', deleteInterviewExp);
router.post('/interviews/:id/upvote', upvoteInterviewExp);

// Opportunities
router.get('/opportunities', getOpportunities);
router.post('/opportunities', oppValidators, createOpportunity);
router.delete('/opportunities/:id', deleteOpportunity);

module.exports = router;
