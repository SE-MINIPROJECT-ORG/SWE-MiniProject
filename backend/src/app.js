const express = require('express');
const cors = require('cors');
const requestId = require('./middleware/requestId');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./modules/health/health.routes');

const app = express();

app.use(requestId);
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use(healthRoutes);
// Feature routers are mounted here as each module is built, for example:
// app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
