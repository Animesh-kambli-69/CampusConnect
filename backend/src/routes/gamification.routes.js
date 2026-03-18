'use strict';

const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getLeaderboard, getMyStats } = require('../controllers/gamification.controller');

const router = express.Router();
router.use(protect);

router.get('/', getLeaderboard);
router.get('/me', getMyStats);

module.exports = router;
