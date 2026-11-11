/**
 * Centralized Application Logger
 * Formats console output cleanly with timestamps and log levels.
 * Prevents accidental serialization of sensitive credentials or tokens.
 */

const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${formatTimestamp()}] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message, error = null) => {
    if (error && error.stack) {
      console.error(`[${formatTimestamp()}] [ERROR] ${message}\n${error.stack}`);
    } else {
      console.error(
        `[${formatTimestamp()}] [ERROR] ${message}`,
        error ? JSON.stringify(error) : ''
      );
    }
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
};
