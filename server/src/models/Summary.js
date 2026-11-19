import mongoose from 'mongoose';

const takeawaySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    pageRef: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true
    },
    summaryType: {
      type: String,
      enum: {
        values: ['short', 'medium', 'detailed'],
        message: 'Invalid summary type'
      },
      required: [true, 'Summary type is required']
    },
    executiveSummary: {
      type: String,
      required: [true, 'Executive summary content is required'],
      trim: true
    },
    summaryContent: {
      type: String,
      default: '',
      trim: true
    },
    keyTakeaways: {
      type: [takeawaySchema],
      default: []
    },
    sections: {
      type: [sectionSchema],
      default: []
    },
    modelUsed: {
      type: String,
      default: 'gemini-1.5-flash',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['generating', 'completed', 'failed'],
        message: 'Invalid summary status'
      },
      default: 'completed'
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
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

// Unique index: one summary per (documentId, summaryType) pair
summarySchema.index({ documentId: 1, summaryType: 1 }, { unique: true });

summarySchema.methods.toSafeJSON = function () {
  return {
    id: this._id ? this._id.toString() : this.id,
    documentId: this.documentId ? this.documentId.toString() : null,
    userId: this.userId ? this.userId.toString() : null,
    summaryType: this.summaryType,
    executiveSummary: this.executiveSummary,
    summaryContent: this.summaryContent,
    keyTakeaways: this.keyTakeaways,
    sections: this.sections,
    modelUsed: this.modelUsed,
    status: this.status,
    errorMessage: this.errorMessage,
    generatedAt: this.generatedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const Summary = mongoose.model('Summary', summarySchema);

export default Summary;
