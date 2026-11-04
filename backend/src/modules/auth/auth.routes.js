const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');
const controller = require('./auth.controller');

// Mounted at /api/auth
const authRouter = express.Router();
authRouter.post('/register', asyncHandler(controller.register));
authRouter.post('/login', loginLimiter, asyncHandler(controller.login));
authRouter.post('/logout', authenticate, asyncHandler(controller.logout));

// Mounted at /api/users (admin user management is added in Sprint 2)
const usersRouter = express.Router();
usersRouter.get('/me', authenticate, asyncHandler(controller.me));

module.exports = { authRouter, usersRouter };
