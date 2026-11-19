import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    pageReferences: {
      type: [Number],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
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
    messages: {
      type: [messageSchema],
      default: []
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

// One conversation record per (documentId, userId)
conversationSchema.index({ documentId: 1, userId: 1 }, { unique: true });

conversationSchema.methods.toSafeJSON = function () {
  return {
    id: this._id ? this._id.toString() : this.id,
    documentId: this.documentId ? this.documentId.toString() : null,
    userId: this.userId ? this.userId.toString() : null,
    messages: (this.messages || []).map((m) => ({
      id: m._id ? m._id.toString() : m.id,
      role: m.role,
      content: m.content,
      text: m.content, // Friendly client alias
      sender: m.role === 'user' ? 'user' : 'ai', // Match Phase 1 component format
      pageReferences: m.pageReferences || [],
      createdAt: m.createdAt,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
