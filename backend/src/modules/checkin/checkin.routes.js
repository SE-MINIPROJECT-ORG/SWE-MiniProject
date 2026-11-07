const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./checkin.controller');

// Mounted at /api
const router = express.Router();
router.post('/events/:id/checkins', authenticate, requireRole('ORGANIZER', 'ADMIN'), asyncHandler(controller.checkIn));

module.exports = router;
