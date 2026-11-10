const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./reports.controller');

// Mounted at /api
const router = express.Router();
const organizerOrAdmin = [authenticate, requireRole('ORGANIZER', 'ADMIN')];
router.get('/events/:id/report', organizerOrAdmin, asyncHandler(controller.report));
router.get('/events/:id/attendees.csv', organizerOrAdmin, asyncHandler(controller.csv));
router.get('/admin/dashboard', authenticate, requireRole('ADMIN'), asyncHandler(controller.dashboard));

module.exports = router;
