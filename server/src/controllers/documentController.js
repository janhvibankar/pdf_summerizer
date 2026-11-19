import path from 'path';
import { Document } from '../models/Document.js';
import { Summary } from '../models/Summary.js';
import { Conversation } from '../models/Conversation.js';
import { storageService } from '../services/storageService.js';
import { extractTextFromPdf } from '../services/pdfService.js';
import { generateSummary } from '../services/geminiService.js';
import { answerDocumentQuestion } from '../services/ragService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

/**
 * Upload and ingest a new PDF document
 */
export const uploadDocument = async (req, res, next) => {
  let savedStorageKey = null;
  let savedStorageProvider = 'local';

  try {
    const file = req.file;
    if (!file) {
      throw ApiError.badRequest('No PDF file uploaded.', 'FILE_REQUIRED');
    }

    const userId = req.user._id;

    // 1. Extract text and validate PDF format
    const extractionResult = await extractTextFromPdf(file.buffer);

    // 2. Persist PDF to storage (local secure storage or Cloudinary)
    const storageResult = await storageService.saveFile({
      buffer: file.buffer,
      originalName: file.originalname,
      userId
    });

    savedStorageKey = storageResult.storageKey;
    savedStorageProvider = storageResult.storageProvider;

    const displayName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[-_]+/g, ' ')
      .trim();

    // 3. Create Document record in MongoDB (with rollback cleanup if insertion fails)
    let document;
    try {
      document = await Document.create({
        userId,
        originalName: file.originalname,
        displayName: displayName || 'Untitled Document',
        mimeType: file.mimetype || 'application/pdf',
        fileSize: file.size,
        pageCount: extractionResult.pageCount,
        wordCount: extractionResult.wordCount,
        characterCount: extractionResult.characterCount,
        readingTimeMin: extractionResult.readingTimeMin,
        storageProvider: storageResult.storageProvider,
        storageKey: storageResult.storageKey,
        extractionStatus: extractionResult.isScanned ? 'scanned_no_text' : 'completed',
        processingStatus: 'completed',
        extractedText: extractionResult.extractedText,
        pages: extractionResult.pages,
        errorMessage: extractionResult.isScanned
          ? 'Scanned or image-only PDF detected. This document does not contain extractable text; OCR is not currently supported in this phase.'
          : null
      });
    } catch (dbErr) {
      // Clean up orphaned physical file if database insertion fails
      if (savedStorageKey) {
        await storageService.deleteFile({
          storageKey: savedStorageKey,
          storageProvider: savedStorageProvider
        }).catch((cleanupErr) => {
          logger.error(`[Upload] Failed to clean up orphaned storage file ${savedStorageKey}: ${cleanupErr.message}`);
        });
      }
      throw dbErr;
    }

    logger.info(`[Document] Ingested "${document.displayName}" (${document.pageCount} pages) for user ${userId}`);

    return ApiResponse.success(res, {
      statusCode: 201,
      message: extractionResult.isScanned
        ? 'Document uploaded, but scanned/image-only text was detected (OCR not supported in this phase).'
        : 'Document uploaded and text extracted successfully.',
      data: {
        document: document.toSafeJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List all documents owned by the authenticated user
 */
export const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Documents retrieved successfully.',
      data: {
        documents: documents.map((doc) => doc.toSafeJSON())
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single document metadata
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    // Ownership check
    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to access this document.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Document retrieved.',
      data: {
        document: document.toSafeJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get document extracted text and page breakdown for reader view
 */
export const getDocumentContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id).select('+extractedText +pages');

    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to access this document.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Document content retrieved.',
      data: {
        id: document._id.toString(),
        title: document.displayName,
        pageCount: document.pageCount,
        pages: document.pages || [],
        extractedText: document.extractedText || '',
        isScanned: document.extractionStatus === 'scanned_no_text'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a document, stored physical file, and associated summaries/chat
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to delete this document.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    // 1. Delete physical storage file
    await storageService.deleteFile({
      storageKey: document.storageKey,
      storageProvider: document.storageProvider
    });

    // 2. Cascade delete associated summaries and conversations
    await Summary.deleteMany({ documentId: document._id });
    await Conversation.deleteMany({ documentId: document._id });

    // 3. Delete document record
    await Document.findByIdAndDelete(document._id);

    logger.info(`[Document] Deleted document ${id} and associated records.`);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Document and associated data deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate or regenerate AI summary for a document
 */
export const summarizeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { summaryType = 'medium' } = req.body || {};

    const validTypes = ['short', 'medium', 'detailed'];
    if (!validTypes.includes(summaryType)) {
      throw ApiError.badRequest("Invalid summaryType. Must be 'short', 'medium', or 'detailed'.");
    }

    const document = await Document.findById(id).select('+extractedText +pages');
    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to summarize this document.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    if (document.extractionStatus === 'scanned_no_text') {
      throw ApiError.badRequest(
        'Cannot summarize scanned or image-only PDF. This document does not contain extractable text; OCR is not currently supported.',
        'SCANNED_PDF_CANNOT_SUMMARIZE'
      );
    }

    // Generate summary via Gemini service
    const summaryData = await generateSummary({
      documentTitle: document.displayName,
      extractedText: document.extractedText,
      pages: document.pages,
      summaryType
    });

    // Save or update Summary record in MongoDB
    const summary = await Summary.findOneAndUpdate(
      { documentId: document._id, summaryType },
      {
        userId: req.user._id,
        documentId: document._id,
        summaryType,
        executiveSummary: summaryData.executiveSummary,
        summaryContent: summaryData.summaryContent,
        keyTakeaways: summaryData.keyTakeaways,
        sections: summaryData.sections,
        status: 'completed',
        generatedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: `${summaryType.toUpperCase()} summary generated successfully.`,
      data: {
        summary: summary.toSafeJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get existing summary for a document
 */
export const getDocumentSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const summaryType = req.query.summaryType || req.query.type || 'medium';

    const document = await Document.findById(id);
    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to view this document summary.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    const summary = await Summary.findOne({ documentId: document._id, summaryType });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: summary ? 'Summary retrieved.' : 'No summary found for this mode.',
      data: {
        summary: summary ? summary.toSafeJSON() : null
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Ask a question grounded in document content (RAG)
 */
export const chatWithDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body || {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      throw ApiError.badRequest('Question string is required.', 'QUESTION_REQUIRED');
    }

    const document = await Document.findById(id).select('+pages');
    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to query this document.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    if (document.extractionStatus === 'scanned_no_text') {
      throw ApiError.badRequest(
        'Document is an image-only scanned PDF with no extractable text. Questions cannot be answered.',
        'SCANNED_DOCUMENT_UNSUPPORTED'
      );
    }

    // Load or initialize conversation history
    let conversation = await Conversation.findOne({ documentId: document._id, userId: req.user._id });
    if (!conversation) {
      conversation = new Conversation({
        userId: req.user._id,
        documentId: document._id,
        messages: []
      });
    }

    // Call RAG answering pipeline
    const ragResult = await answerDocumentQuestion({
      documentTitle: document.displayName,
      pages: document.pages,
      question: question.trim(),
      conversationHistory: conversation.messages
    });

    // Append user question and assistant answer to message history
    const userMsg = {
      role: 'user',
      content: question.trim(),
      createdAt: new Date()
    };

    const assistantMsg = {
      role: 'assistant',
      content: ragResult.answer,
      pageReferences: ragResult.pageReferences,
      createdAt: new Date()
    };

    conversation.messages.push(userMsg, assistantMsg);
    await conversation.save();

    const formattedMessages = conversation.toSafeJSON().messages;
    const lastAssistantMessage = formattedMessages[formattedMessages.length - 1];

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Question answered successfully.',
      data: {
        answer: ragResult.answer,
        pageReferences: ragResult.pageReferences,
        message: lastAssistantMessage
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve chat history for a document
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      throw ApiError.notFound('Document not found.', 'DOCUMENT_NOT_FOUND');
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You do not have permission to view this chat history.', 'FORBIDDEN_DOCUMENT_ACCESS');
    }

    const conversation = await Conversation.findOne({ documentId: document._id, userId: req.user._id });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Chat history retrieved.',
      data: {
        messages: conversation ? conversation.toSafeJSON().messages : []
      }
    });
  } catch (err) {
    next(err);
  }
};

export default {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentContent,
  deleteDocument,
  summarizeDocument,
  getDocumentSummary,
  chatWithDocument,
  getChatHistory
};
