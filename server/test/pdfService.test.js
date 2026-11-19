import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePdfSignature,
  extractTextFromPdf,
  chunkDocument
} from '../src/services/pdfService.js';

describe('PDF Service Unit Tests', () => {
  // Minimal valid PDF binary representation
  const validPdfContent =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';
  const validBuffer = Buffer.from(validPdfContent);

  test('validatePdfSignature accepts buffer starting with %PDF-', () => {
    assert.equal(validatePdfSignature(validBuffer), true);
  });

  test('validatePdfSignature rejects non-PDF buffer', () => {
    const fakeBuffer = Buffer.from('NOT A PDF FILE');
    assert.throws(() => validatePdfSignature(fakeBuffer), {
      name: 'ApiError',
      message: /does not match PDF signature/
    });
  });

  test('validatePdfSignature rejects truncated or empty buffer', () => {
    assert.throws(() => validatePdfSignature(Buffer.from('')), {
      name: 'ApiError'
    });
    assert.throws(() => validatePdfSignature(Buffer.from('%PD')), {
      name: 'ApiError'
    });
  });

  test('extractTextFromPdf parses document structure and detects empty/scanned PDF', async () => {
    const result = await extractTextFromPdf(validBuffer);
    assert.equal(result.pageCount, 1);
    assert.equal(Array.isArray(result.pages), true);
    assert.equal(result.pages.length, 1);
    assert.equal(result.pages[0].pageNumber, 1);
    // Since this minimal sample contains no font text streams, it should detect scanned/no text
    assert.equal(result.isScanned, true);
    assert.equal(result.characterCount < 20, true);
  });

  test('chunkDocument preserves page metadata and chunk IDs', () => {
    const mockPages = [
      {
        pageNumber: 1,
        text: 'This is the introduction section of page one discussing renewable solar power systems.'
      },
      {
        pageNumber: 2,
        text: 'Page two continues with wind turbine operational telemetry, efficiency ratings, and grid stability.'
      }
    ];

    const chunks = chunkDocument(mockPages, 1000, 100);
    assert.equal(chunks.length, 2);
    assert.equal(chunks[0].pageNumber, 1);
    assert.ok(chunks[0].text.includes('solar power'));
    assert.equal(chunks[1].pageNumber, 2);
    assert.ok(chunks[1].text.includes('wind turbine'));
  });

  test('chunkDocument handles long text with paragraph/sentence splitting', () => {
    const longText =
      'Sentence one provides initial context. '.repeat(40) +
      '\n\n' +
      'Sentence two provides deep analytical insights into infrastructure reliability. '.repeat(40);
    const mockPages = [{ pageNumber: 5, text: longText }];

    const chunks = chunkDocument(mockPages, 600, 100);
    assert.ok(chunks.length > 1);
    chunks.forEach((chunk) => {
      assert.equal(chunk.pageNumber, 5);
      assert.ok(chunk.text.length <= 700);
    });
  });
});
