const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./registrations.controller');

// Mounted at /api. Only attendees register (EVT-F-005).
const router = express.Router();
const attendeeOnly = [authenticate, requireRole('ATTENDEE')];

router.post('/events/:id/registrations', attendeeOnly, asyncHandler(controller.register));
router.get('/registrations/me', attendeeOnly, asyncHandler(controller.mine));
router.post('/registrations/:id/cancel', attendeeOnly, asyncHandler(controller.cancel));

module.exports = router;
