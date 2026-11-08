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
eventsRouter.put('/:id', authenticate, requireRole('ORGANIZER', 'ADMIN'), asyncHandler(controller.update));
eventsRouter.post('/:id/cancel', authenticate, requireRole('ORGANIZER', 'ADMIN'), asyncHandler(controller.cancel));

// Mounted at /api/categories. Everyone can list; only admins change them (EVT-F-015).
const categoriesRouter = express.Router();
const adminOnly = [authenticate, requireRole('ADMIN')];
categoriesRouter.get('/', asyncHandler(controller.categories));
categoriesRouter.post('/', adminOnly, asyncHandler(controller.createCategory));
categoriesRouter.put('/:id', adminOnly, asyncHandler(controller.renameCategory));
categoriesRouter.delete('/:id', adminOnly, asyncHandler(controller.deleteCategory));

module.exports = { eventsRouter, categoriesRouter };
