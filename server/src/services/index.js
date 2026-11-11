/**
 * PRANPAN Application Services Registry
 *
 * Houses business logic isolated from HTTP transport controllers:
 * - pdfService: PDF extraction, text normalization, page chunking (Phase 1)
 * - aiService: Google Gemini API integration and prompt orchestration (Phase 1)
 * - documentService: Document persistence and metadata management (Phase 1)
 * - authService: Password hashing, JWT issuance and verification (Phase 2)
 */

export const services = {};

export default services;
