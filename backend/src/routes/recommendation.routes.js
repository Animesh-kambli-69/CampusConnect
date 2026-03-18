'use strict';

const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getRecommendations } = require('../controllers/recommendation.controller');

const router = express.Router();
router.use(protect);

router.get('/', getRecommendations);

module.exports = router;
