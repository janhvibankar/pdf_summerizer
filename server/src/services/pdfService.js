/* eslint-disable no-control-regex */
import { PDFParse } from 'pdf-parse';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

// PDF Magic Bytes signature: "%PDF-"
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

/**
 * Validate that a buffer begins with the PDF magic bytes signature
 * @param {Buffer} buffer
 */
export const validatePdfSignature = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw ApiError.badRequest('Invalid file payload: Expected a binary buffer.', 'INVALID_BUFFER');
  }

  if (buffer.length < 5) {
    throw ApiError.badRequest('File is too small to be a valid PDF document.', 'CORRUPTED_PDF');
  }

  // Check magic bytes "%PDF-"
  if (buffer.subarray(0, 5).compare(PDF_MAGIC_BYTES) !== 0) {
    throw ApiError.badRequest(
      'Corrupted or forged file: File header does not match PDF signature (%PDF-).',
      'INVALID_PDF_SIGNATURE'
    );
  }

  return true;
};

/**
 * Extract text and metadata from a PDF buffer
 * @param {Buffer} buffer - Validated PDF buffer
 * @returns {Promise<{
 *   isScanned: boolean,
 *   pageCount: number,
 *   wordCount: number,
 *   characterCount: number,
 *   readingTimeMin: number,
 *   extractedText: string,
 *   pages: Array<{ pageNumber: number, text: string, wordCount: number }>
 * }>}
 */
export const extractTextFromPdf = async (buffer) => {
  validatePdfSignature(buffer);

  let parser = null;
  try {
    parser = new PDFParse({ data: buffer });
    await parser.load();

    const info = await parser.getInfo();
    const textResult = await parser.getText();

    const totalPages = info.total || (textResult.pages ? textResult.pages.length : 0);

    // Enforce page count limit
    const maxPages = env.MAX_PDF_PAGES || 100;
    if (totalPages > maxPages) {
      throw ApiError.badRequest(
        `Document exceeds the maximum page limit of ${maxPages} pages (contains ${totalPages} pages).`,
        'PAGE_LIMIT_EXCEEDED'
      );
    }

    const pages = [];
    let combinedText = '';
    let totalWordCount = 0;
    let totalCharCount = 0;

    const rawPages = textResult.pages || [];

    for (let i = 0; i < rawPages.length; i++) {
      const pageNum = rawPages[i].num || i + 1;
      const rawText = rawPages[i].text || '';

      // Normalize whitespace and remove control characters
      const cleanText = rawText
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .trim();

      const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
      const wordCount = words.length;

      pages.push({
        pageNumber: pageNum,
        text: cleanText,
        wordCount
      });

      if (cleanText) {
        combinedText += `\n--- Page ${pageNum} ---\n${cleanText}\n`;
      }
      totalWordCount += wordCount;
      totalCharCount += cleanText.length;
    }

    // Detect empty or image-only scanned PDFs
    // If fewer than 20 substantive characters across all pages, document is scanned / non-extractable
    const isScanned = totalCharCount < 20;

    const readingTimeMin = Math.max(1, Math.ceil(totalWordCount / 200));

    if (isScanned) {
      logger.warn(`[PDF] Scanned or image-only PDF detected (Total extractable chars: ${totalCharCount}).`);
    }

    return {
      isScanned,
      pageCount: totalPages,
      wordCount: totalWordCount,
      characterCount: totalCharCount,
      readingTimeMin,
      extractedText: combinedText.trim(),
      pages
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;

    logger.error('[PDF] Extraction failed:', err.message);
    throw ApiError.badRequest(
      `Failed to parse PDF document: ${err.message || 'The PDF file is corrupted or encrypted with an unsupported cipher.'}`,
      'PDF_EXTRACTION_FAILED'
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Ignore parser teardown errors
      }
    }
  }
};

/**
 * Split document pages into cohesive overlapping text chunks for retrieval and long summarization
 * @param {Array<{ pageNumber: number, text: string }>} pages
 * @param {number} maxChunkChars - Maximum characters per chunk (approx 350-400 words)
 * @param {number} overlapChars - Character overlap between sequential chunks
 * @returns {Array<{
 *   id: string,
 *   pageNumber: number,
 *   text: string,
 *   charCount: number,
 *   wordCount: number
 * }>}
 */
export const chunkDocument = (pages, maxChunkChars = 1500, overlapChars = 200) => {
  if (!pages || !Array.isArray(pages) || pages.length === 0) {
    return [];
  }

  const chunks = [];
  let chunkCounter = 1;

  for (const page of pages) {
    const pageText = (page.text || '').trim();
    if (!pageText) continue;

    if (pageText.length <= maxChunkChars) {
      chunks.push({
        id: `chunk-p${page.pageNumber}-${chunkCounter++}`,
        pageNumber: page.pageNumber,
        text: pageText,
        charCount: pageText.length,
        wordCount: pageText.split(/\s+/).filter(Boolean).length
      });
      continue;
    }

    // Split page into overlapping chunks
    let startIdx = 0;
    while (startIdx < pageText.length) {
      let endIdx = startIdx + maxChunkChars;

      // Try to break at paragraph or sentence boundary instead of mid-word
      if (endIdx < pageText.length) {
        const sentenceBreak = pageText.lastIndexOf('. ', endIdx);
        const paragraphBreak = pageText.lastIndexOf('\n\n', endIdx);
        const breakPoint = Math.max(paragraphBreak, sentenceBreak);

        if (breakPoint > startIdx + Math.floor(maxChunkChars * 0.6)) {
          endIdx = breakPoint + 1;
        } else {
          const spaceBreak = pageText.lastIndexOf(' ', endIdx);
          if (spaceBreak > startIdx) {
            endIdx = spaceBreak;
          }
        }
      }

      const chunkText = pageText.slice(startIdx, endIdx).trim();
      if (chunkText) {
        chunks.push({
          id: `chunk-p${page.pageNumber}-${chunkCounter++}`,
          pageNumber: page.pageNumber,
          text: chunkText,
          charCount: chunkText.length,
          wordCount: chunkText.split(/\s+/).filter(Boolean).length
        });
      }

      startIdx = endIdx - overlapChars;
      if (startIdx >= pageText.length - overlapChars) {
        break;
      }
    }
  }

  return chunks;
};

export default {
  validatePdfSignature,
  extractTextFromPdf,
  chunkDocument
};
