import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

let server;

const startServer = async () => {
  try {
    // Validate environment setup
    const { warnings } = validateEnv();
    warnings.forEach((warn) => logger.warn(warn));

    // Connect to database (non-blocking for local Phase 0 bootstrap)
    await connectDB();

    // Start HTTP listener
    server = app.listen(env.PORT, () => {
      logger.info(`====================================================`);
      logger.info(` PRANPAN API Service Started`);
      logger.info(` Environment : ${env.NODE_ENV}`);
      logger.info(` Port        : ${env.PORT}`);
      logger.info(` Health Check: http://localhost:${env.PORT}/api/health`);
      logger.info(` CORS Origin : ${env.CLIENT_ORIGIN.join(', ')}`);
      logger.info(`====================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown management
const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Graceful shutdown complete.');
      process.exit(0);
    });

    // Enforce shutdown timeout if connections linger
    setTimeout(() => {
      logger.error('Forceful shutdown triggered after timeout.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
