'use strict';

const { body } = require('express-validator');
const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getProjects,
  getProjectById,
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
} = require('../controllers/project.controller');

const router = express.Router();
router.use(protect);

const createValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('description').optional().isLength({ max: 3000 }).withMessage('Description too long'),
];

router.get('/', getProjects);
router.post('/', createValidators, createProject);
router.get('/user/:userId', getUserProjects);
router.get('/:id', getProjectById);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/like', likeProject);

module.exports = router;
