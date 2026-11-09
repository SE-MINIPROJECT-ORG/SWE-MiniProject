const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { loginLimiter } = require('../../middleware/rateLimiter');
const controller = require('./auth.controller');

// Mounted at /api/auth
const authRouter = express.Router();
authRouter.post('/register', asyncHandler(controller.register));
authRouter.post('/login', loginLimiter, asyncHandler(controller.login));
authRouter.post('/logout', authenticate, asyncHandler(controller.logout));

// Mounted at /api/users
const usersRouter = express.Router();
const adminOnly = [authenticate, requireRole('ADMIN')];
usersRouter.get('/me', authenticate, asyncHandler(controller.me));
usersRouter.put('/me', authenticate, asyncHandler(controller.updateMe));
usersRouter.put('/me/password', authenticate, asyncHandler(controller.changePassword));
usersRouter.get('/', adminOnly, asyncHandler(controller.listUsers));
usersRouter.patch('/:id/role', adminOnly, asyncHandler(controller.changeRole));
usersRouter.patch('/:id/status', adminOnly, asyncHandler(controller.changeStatus));

module.exports = { authRouter, usersRouter };
