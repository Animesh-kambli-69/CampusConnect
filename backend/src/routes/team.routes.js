'use strict';

const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getTeamRecommendations } = require('../controllers/team.controller');

const router = express.Router();
router.use(protect);

// GET /api/teams/match?skills=React,Node.js
router.get('/match', getTeamRecommendations);

module.exports = router;
