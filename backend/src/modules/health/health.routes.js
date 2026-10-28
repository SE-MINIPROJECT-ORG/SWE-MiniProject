const express = require('express');
const db = require('../../config/db');
const logger = require('../../utils/logger');

const router = express.Router();

// Used by monitoring and by EVT-NF-002 (availability checks).
router.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ok', api: 'up', database: 'up' });
  } catch (error) {
    logger.warn('Health check: database unreachable', { message: error.message });
    res.status(503).json({ status: 'degraded', api: 'up', database: 'down' });
  }
});

module.exports = router;
