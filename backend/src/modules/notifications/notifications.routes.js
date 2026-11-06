const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const controller = require('./notifications.controller');

// Mounted at /api/notifications. Every logged-in user has their own list.
const router = express.Router();
router.get('/', authenticate, asyncHandler(controller.mine));
router.patch('/:id/read', authenticate, asyncHandler(controller.markRead));

module.exports = router;
