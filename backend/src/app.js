const express = require('express');
const cors = require('cors');
const requestId = require('./middleware/requestId');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./modules/health/health.routes');
const { authRouter, usersRouter } = require('./modules/auth/auth.routes');
const { eventsRouter, categoriesRouter } = require('./modules/events/events.routes');

const app = express();

// Behind nginx the real client IP is in X-Forwarded-For; rate limiting needs it.
app.set('trust proxy', 1);

app.use(requestId);
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use(healthRoutes);
app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
