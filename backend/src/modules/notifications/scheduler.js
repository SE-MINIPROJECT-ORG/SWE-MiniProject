// Runs the reminder job every minute (EVT-F-033), so each reminder goes out
// within about a minute of the 24-hour mark.
const cron = require('node-cron');
const logger = require('../../utils/logger');
const { sendDueReminders } = require('./notification.service');

async function runReminderJob() {
  try {
    const sent = await sendDueReminders();
    if (sent > 0) logger.info('Reminder emails sent', { count: sent });
  } catch (err) {
    logger.error('Reminder job failed', { message: err.message });
  }
}

function startScheduler() {
  return cron.schedule('* * * * *', runReminderJob);
}

module.exports = { startScheduler, runReminderJob };
