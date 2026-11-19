import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentContent,
  deleteDocument,
  summarizeDocument,
  getDocumentSummary,
  chatWithDocument,
  getChatHistory
} from '../controllers/documentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handlePdfUpload, uploadConcurrencyGuard } from '../middleware/uploadMiddleware.js';
import { uploadLimiter, aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All document operations require an authenticated session
router.use(requireAuth);

// Document Ingestion
router.post('/upload', uploadLimiter, uploadConcurrencyGuard, handlePdfUpload, uploadDocument);

// Document Listing and Management
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

// Document Reader Content (Extracted Text and Page Breakdown)
router.get('/:id/content', getDocumentContent);

// Document Summarization
router.post('/:id/summarize', aiLimiter, summarizeDocument);
router.get('/:id/summary', getDocumentSummary);

// Document Grounded Chat (RAG)
router.post('/:id/chat', aiLimiter, chatWithDocument);
router.get('/:id/chat', getChatHistory);
router.get('/:id/chat-history', getChatHistory);

export default router;
