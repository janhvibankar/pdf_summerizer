import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

// Configure memory storage with strict boundary limits
const storage = multer.memoryStorage();

const MAX_BYTES = (env.MAX_PDF_SIZE_MB || 15) * 1024 * 1024;
const MAX_CONCURRENT_UPLOADS = 5;
let activeConcurrentUploads = 0;

export const getActiveConcurrentUploads = () => activeConcurrentUploads;
export const resetActiveConcurrentUploads = () => {
  activeConcurrentUploads = 0;
};

/**
 * Concurrency guard to prevent Node.js heap memory exhaustion
 * during simultaneous multi-megabyte PDF uploads.
 */
export const uploadConcurrencyGuard = (req, res, next) => {
  if (activeConcurrentUploads >= MAX_CONCURRENT_UPLOADS) {
    return next(
      ApiError.tooManyRequests(
        'Server is currently processing the maximum allowed concurrent uploads. Please retry in a few seconds.',
        'SERVER_UPLOADS_BUSY'
      )
    );
  }

  activeConcurrentUploads++;
  let decremented = false;
  const decrement = () => {
    if (!decremented) {
      decremented = true;
      activeConcurrentUploads = Math.max(0, activeConcurrentUploads - 1);
    }
  };

  res.on('finish', decrement);
  res.on('close', decrement);
  next();
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ['application/pdf', 'application/x-pdf'];

  if (ext !== '.pdf') {
    return cb(
      ApiError.badRequest(
        `Invalid file extension '${ext}'. Only PDF files (.pdf) are permitted.`,
        'INVALID_FILE_EXTENSION'
      ),
      false
    );
  }

  if (!allowedMimes.includes(file.mimetype.toLowerCase())) {
    return cb(
      ApiError.badRequest(
        `Invalid MIME type '${file.mimetype}'. Expected 'application/pdf'.`,
        'INVALID_MIME_TYPE'
      ),
      false
    );
  }

  cb(null, true);
};

// Accept canonical 'file' field, with 'pdf' field retained as a single fallback alias
const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_BYTES,
    files: 1
  },
  fileFilter
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

/**
 * Express wrapper middleware that intercepts Multer errors,
 * validates against duplicate payloads, normalizes field names,
 * and formats errors into standard ApiError format.
 */
export const handlePdfUpload = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            ApiError.badRequest(
              `File exceeds the maximum permitted limit of ${env.MAX_PDF_SIZE_MB || 15} MB.`,
              'FILE_TOO_LARGE'
            )
          );
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(
            ApiError.badRequest(
              'Only one PDF document may be uploaded per request.',
              'MULTIPLE_FILES_NOT_ALLOWED'
            )
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            ApiError.badRequest(
              "Unexpected field name or duplicate file payload. Form field must be named 'file'.",
              'UNEXPECTED_UPLOAD_FIELD'
            )
          );
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`, 'UPLOAD_ERROR'));
      }
      return next(err);
    }

    // Verify whether the client attempted to send both 'file' and 'pdf' simultaneously
    const fileFieldsCount = (req.files?.file?.length || 0) + (req.files?.pdf?.length || 0);
    if (fileFieldsCount > 1) {
      return next(
        ApiError.badRequest(
          'Duplicate file payloads detected in request. Provide only one PDF file under the canonical "file" field.',
          'DUPLICATE_PAYLOAD_REJECTED'
        )
      );
    }

    // Normalize req.file from canonical 'file' or legacy alias 'pdf'
    const uploadedFile = req.files?.file?.[0] || req.files?.pdf?.[0];

    if (!uploadedFile) {
      return next(
        ApiError.badRequest(
          'No PDF file provided in request. Form field must be named "file".',
          'FILE_REQUIRED'
        )
      );
    }

    req.file = uploadedFile;
    next();
  });
};

export default {
  uploadConcurrencyGuard,
  handlePdfUpload
};
