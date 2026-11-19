import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    pageNumber: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    wordCount: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
      trim: true
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [0, 'File size cannot be negative']
    },
    pageCount: {
      type: Number,
      default: 0,
      min: [0, 'Page count cannot be negative']
    },
    wordCount: {
      type: Number,
      default: 0,
      min: [0, 'Word count cannot be negative']
    },
    characterCount: {
      type: Number,
      default: 0,
      min: [0, 'Character count cannot be negative']
    },
    readingTimeMin: {
      type: Number,
      default: 0,
      min: [0, 'Reading time cannot be negative']
    },
    storageProvider: {
      type: String,
      enum: {
        values: ['local', 'cloudinary'],
        message: 'Invalid storage provider'
      },
      default: 'local'
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key / path is required'],
      trim: true
    },
    extractionStatus: {
      type: String,
      enum: {
        values: ['pending', 'extracting', 'completed', 'failed', 'scanned_no_text'],
        message: 'Invalid extraction status'
      },
      default: 'pending'
    },
    processingStatus: {
      type: String,
      enum: {
        values: ['uploaded', 'processing', 'completed', 'failed'],
        message: 'Invalid processing status'
      },
      default: 'uploaded'
    },
    extractedText: {
      type: String,
      default: '',
      select: false // Avoid pulling massive text blocks into general list queries
    },
    pages: {
      type: [pageSchema],
      default: [],
      select: false // Avoid pulling detailed page arrays into general list queries
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : doc.id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : doc.id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for fast user library queries ordered by creation date
documentSchema.index({ userId: 1, createdAt: -1 });

/**
 * Return safe public presentation representation
 */
documentSchema.methods.toSafeJSON = function () {
  return {
    id: this._id ? this._id.toString() : this.id,
    userId: this.userId ? this.userId.toString() : null,
    title: this.displayName,
    fileName: this.originalName,
    mimeType: this.mimeType,
    fileSize: this.fileSize,
    fileSizeBytes: this.fileSize,
    pageCount: this.pageCount,
    wordCount: this.wordCount,
    characterCount: this.characterCount,
    readingTimeMin: this.readingTimeMin,
    storageProvider: this.storageProvider,
    extractionStatus: this.extractionStatus,
    processingStatus: this.processingStatus,
    errorMessage: this.errorMessage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const Document = mongoose.model('Document', documentSchema);

export default Document;
