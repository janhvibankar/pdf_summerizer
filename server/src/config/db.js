import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConfigured = Boolean(env.MONGO_URI);

const readyStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const getDbStatus = () => {
  if (!isConfigured) {
    return {
      status: 'not_configured',
      connected: false
    };
  }

  const stateCode = mongoose.connection.readyState;
  const status = readyStateMap[stateCode] || 'unknown';

  return {
    status,
    connected: stateCode === 1
  };
};

export const connectDB = async () => {
  if (!env.MONGO_URI) {
    logger.warn(
      '[DB] MONGO_URI is not configured. Running in disconnected-database mode for local development.'
    );
    isConfigured = false;
    return false;
  }

  try {
    isConfigured = true;
    logger.info('[DB] Connecting to MongoDB...');

    mongoose.connection.on('connected', () => {
      logger.info('[DB] MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('[DB] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[DB] MongoDB connection disconnected.');
    });

    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: !env.isProduction
    });

    return true;
  } catch (error) {
    logger.warn(
      `[DB] Could not connect to MongoDB: ${error.message}. Server will remain functional for non-database operations.`
    );
    return false;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      logger.info('[DB] Closing MongoDB connection...');
      await mongoose.connection.close(false);
      logger.info('[DB] MongoDB connection closed.');
    } catch (error) {
      logger.error('[DB] Error while closing MongoDB connection:', error);
    }
  }
};
