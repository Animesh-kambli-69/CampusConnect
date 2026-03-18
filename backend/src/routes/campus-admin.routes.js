'use strict';

const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  getCampusAnalytics,
  getCampusUsers,
  changeUserRole,
  toggleSuspend,
} = require('../controllers/campus-admin.controller');

const router = express.Router();

// All routes require auth + campusAdmin role (superAdmin can also access)
router.use(protect, restrictTo('campusAdmin', 'superAdmin'));

router.get('/analytics', getCampusAnalytics);
router.get('/users', getCampusUsers);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/suspend', toggleSuspend);

module.exports = router;
