const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, optionalAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./events.controller');

// Mounted at /api/events
const eventsRouter = express.Router();
eventsRouter.get('/', asyncHandler(controller.search));
eventsRouter.get('/mine', authenticate, requireRole('ORGANIZER'), asyncHandler(controller.mine));
eventsRouter.get('/:id', optionalAuth, asyncHandler(controller.getOne));
eventsRouter.post('/', authenticate, requireRole('ORGANIZER'), asyncHandler(controller.create));
eventsRouter.post('/:id/publish', authenticate, requireRole('ORGANIZER'), asyncHandler(controller.publish));

// Mounted at /api/categories (add, rename and delete come in Sprint 2)
const categoriesRouter = express.Router();
categoriesRouter.get('/', asyncHandler(controller.categories));

module.exports = { eventsRouter, categoriesRouter };
