const SMTPServer = require('smtp-server').SMTPServer;
const config = require('./config');
const { parseEmail } = require('./services/emailParser');
const { sendToWebhook } = require('./services/webhookService');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const Queue = require('better-queue');
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d'
    })
  ]
});

const webhookQueue = new Queue(async function (parsed, cb) {
  try {
    await sendToWebhook(parsed);
    logger.info('Successfully sent to webhook');
    cb(null);
  } catch (error) {
    logger.error('Webhook error:', { message: error.message, stack: error.stack });
    if (error.response) {
      logger.error('Webhook response error:', { 
        status: error.response.status, 
        data: error.response.data 
      });
    }
    cb(error);
  }
}, { concurrent: config.WEBHOOK_CONCURRENCY || 5 });

const server = new SMTPServer({
  onData(stream, session, callback) {
    parseEmail(stream)
      .then(parsed => {
        webhookQueue.push(parsed);
        logger.info('Email added to queue', { queueSize: webhookQueue.getStats().total });
        callback();
      })
      .catch(error => {
        logger.error('Parsing error:', { message: error.message, stack: error.stack });
        callback(new Error('Failed to parse email'));
      });
  },
  onError(error) {
    logger.error('SMTP server error:', { message: error.message, stack: error.stack });
  },
  disabledCommands: ['AUTH'],
  secure: config.SMTP_SECURE
});

server.listen(config.PORT, '0.0.0.0', err => {
  if (err) {
    logger.error('Failed to start SMTP server:', { message: err.message, stack: err.stack });
    process.exit(1);
  }
  logger.info(`SMTP server listening on port ${config.PORT} on all interfaces`);
});

function gracefulShutdown(reason) {
  logger.info(`Shutting down: ${reason}`);
  server.close(() => {
    logger.info('Server closed. Exiting process.');
    process.exit(0);
  });
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', { message: err.message, stack: err.stack });
  gracefulShutdown('Uncaught exception');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason: reason, promise: promise });
  gracefulShutdown('Unhandled rejection');
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM signal received');
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT signal received');
});