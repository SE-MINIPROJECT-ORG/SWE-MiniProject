const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const requestId = require('./middleware/requestId');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./modules/health/health.routes');
const { authRouter, usersRouter } = require('./modules/auth/auth.routes');
const { eventsRouter, categoriesRouter } = require('./modules/events/events.routes');
const registrationsRouter = require('./modules/registrations/registrations.routes');
const checkinRouter = require('./modules/checkin/checkin.routes');
const notificationsRouter = require('./modules/notifications/notifications.routes');
const reportsRouter = require('./modules/reports/reports.routes');

const app = express();

// Behind nginx the real client IP is in X-Forwarded-For; rate limiting needs it.
app.set('trust proxy', 1);

app.use(requestId);
// Security headers on every API response (EVT-SR-003).
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use(healthRoutes);
app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api', registrationsRouter);
app.use('/api', checkinRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api', reportsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
