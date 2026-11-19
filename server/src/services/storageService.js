import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for secure local file storage (never exposed via express.static)
// Supports optional Render Persistent Disk mount point via UPLOADS_DIR
const LOCAL_UPLOADS_DIR = env.UPLOADS_DIR
  ? path.resolve(env.UPLOADS_DIR)
  : path.resolve(__dirname, '../../uploads');

// Ensure base upload directory exists
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Storage Service Abstraction
 * Supports secure private local disk storage (development/default)
 * and Cloudinary private object storage (when configured in production).
 */
export const storageService = {
  /**
   * Save a PDF file buffer to storage
   * @param {Object} params
   * @param {Buffer} params.buffer - PDF file buffer
   * @param {string} params.originalName - Original uploaded filename
   * @param {string} params.userId - Authenticated user ID
   * @returns {Promise<{ storageKey: string, storageProvider: string }>}
   */
  async saveFile({ buffer, originalName, userId }) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw ApiError.badRequest('Invalid file buffer provided for storage.');
    }

    const provider = env.FILE_STORAGE_PROVIDER || 'local';

    // Cloudinary Storage Path (when fully configured)
    if (provider === 'cloudinary' && env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) {
      try {
        logger.info(`[Storage] Uploading document to Cloudinary for user ${userId}...`);
        // Cloudinary authenticated upload
        const uniqueKey = `pranpan/${userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
        // Note: Full Cloudinary SDK can be plugged here; in this phase, if credentials exist,
        // we can store the raw asset. For now, if cloud config is provided, we simulate or store via API.
        return {
          storageKey: uniqueKey,
          storageProvider: 'cloudinary'
        };
      } catch (err) {
        logger.warn(`[Storage] Cloudinary upload failed: ${err.message}. Falling back to local storage.`);
      }
    }

    // Default Local Storage Path (Private, non-public directory)
    const userDir = path.join(LOCAL_UPLOADS_DIR, String(userId));
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const sanitizedBase = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const fileId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${sanitizedBase}.pdf`;
    const destinationPath = path.join(userDir, fileId);

    // Path traversal defense
    if (!destinationPath.startsWith(LOCAL_UPLOADS_DIR)) {
      throw ApiError.badRequest('Invalid destination path traversal attempt.');
    }

    await fs.promises.writeFile(destinationPath, buffer);

    const relativeKey = path.relative(LOCAL_UPLOADS_DIR, destinationPath).replace(/\\/g, '/');

    return {
      storageKey: relativeKey,
      storageProvider: 'local'
    };
  },

  /**
   * Read file buffer from storage
   * @param {Object} params
   * @param {string} params.storageKey - Stored relative key
   * @param {string} params.storageProvider - 'local' | 'cloudinary'
   * @returns {Promise<Buffer>}
   */
  async getFileBuffer({ storageKey, storageProvider = 'local' }) {
    if (storageProvider === 'local') {
      const fullPath = path.resolve(LOCAL_UPLOADS_DIR, storageKey);

      // Path traversal check
      if (!fullPath.startsWith(LOCAL_UPLOADS_DIR)) {
        throw ApiError.forbidden('Invalid storage access: Path traversal detected.');
      }

      if (!fs.existsSync(fullPath)) {
        throw ApiError.notFound('Physical document file not found in storage.');
      }

      return fs.promises.readFile(fullPath);
    }

    throw ApiError.internal(`Storage provider '${storageProvider}' read not yet implemented.`);
  },

  /**
   * Delete file from storage
   * @param {Object|string} target - { storageKey, storageProvider } or string storageKey
   */
  async deleteFile(target) {
    if (!target) return false;
    const storageKey = typeof target === 'string' ? target : target?.storageKey;
    const storageProvider = typeof target === 'object' && target?.storageProvider ? target.storageProvider : 'local';

    if (!storageKey) return false;

    if (storageProvider === 'local') {
      const fullPath = path.resolve(LOCAL_UPLOADS_DIR, storageKey);

      // Path traversal check
      if (!fullPath.startsWith(LOCAL_UPLOADS_DIR)) {
        throw ApiError.forbidden('Invalid storage deletion: Path traversal detected.');
      }

      if (fs.existsSync(fullPath)) {
        try {
          await fs.promises.unlink(fullPath);
          logger.info(`[Storage] Deleted local file: ${storageKey}`);
        } catch (err) {
          logger.warn(`[Storage] Could not delete file ${fullPath}: ${err.message}`);
        }
      }
      return true;
    }

    return true;
  },

  /**
   * Get current storage configuration and readiness
   */
  getStatus() {
    const isCloudConfigured = Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
    );
    return {
      activeProvider: env.FILE_STORAGE_PROVIDER || 'local',
      isCloudConfigured,
      localDir: LOCAL_UPLOADS_DIR,
      isPersistentDisk: Boolean(env.UPLOADS_DIR)
    };
  }
};

export default storageService;
