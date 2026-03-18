'use strict';

const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getActivity } = require('../controllers/activity.controller');

const router = express.Router();

router.use(protect);
router.get('/', getActivity);

module.exports = router;
