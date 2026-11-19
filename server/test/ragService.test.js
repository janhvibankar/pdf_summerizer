import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeQuery, retrieveRelevantChunks, answerDocumentQuestion } from '../src/services/ragService.js';
import { setGeminiInvoker } from '../src/services/geminiService.js';

describe('RAG & Retrieval Service Unit Tests', () => {
  before(() => {
    // Inject mock invoker for RAG tests
    setGeminiInvoker(async (prompt) => {
      if (prompt.includes('unanswered question') || prompt.includes('Quantum')) {
        return 'The document does not provide enough information to answer this question.';
      }
      return 'According to [Page 2], the degradation rate is 0.4% annually.';
    });
  });

  after(() => {
    setGeminiInvoker(null);
  });

  test('tokenizeQuery removes stopwords and short tokens', () => {
    const tokens = tokenizeQuery('What is the total revenue for the Q3 fiscal period?');
    assert.deepEqual(tokens, ['total', 'revenue', 'fiscal', 'period']);
  });

  test('retrieveRelevantChunks ranks highest-matching chunk first', () => {
    const mockPages = [
      {
        pageNumber: 1,
        text: 'Executive Summary and table of contents for general corporate operations.'
      },
      {
        pageNumber: 2,
        text: 'The solar photovoltaic cell degradation rate dropped to 0.4% annually, representing a key efficiency milestone.'
      },
      {
        pageNumber: 3,
        text: 'Human resources policy and workplace guidelines for regional branch offices.'
      }
    ];

    const results = retrieveRelevantChunks({
      pages: mockPages,
      query: 'What is the solar photovoltaic degradation rate?',
      topK: 2
    });

    assert.ok(results.length > 0);
    assert.equal(results[0].pageNumber, 2);
    assert.ok(results[0].text.includes('0.4% annually'));
    assert.ok(results[0].score > 0);
  });

  test('retrieveRelevantChunks provides fallback chunks when no keywords match', () => {
    const mockPages = [
      { pageNumber: 1, text: 'First section of introduction.' },
      { pageNumber: 2, text: 'Second section of methodology.' }
    ];

    const results = retrieveRelevantChunks({
      pages: mockPages,
      query: 'Quantum entanglement in superconductive lattice',
      topK: 2
    });

    assert.equal(results.length, 2);
    assert.equal(results[0].pageNumber, 1);
  });

  test('answerDocumentQuestion extracts explicit [Page X] citations accurately', async () => {
    const mockPages = [
      { pageNumber: 1, text: 'Company overview and disclaimer.' },
      { pageNumber: 2, text: 'Solar degradation rate achieved was 0.4% per annum.' }
    ];

    const result = await answerDocumentQuestion({
      documentTitle: 'Solar Metrics',
      pages: mockPages,
      question: 'What is the solar degradation rate?'
    });

    assert.ok(result.answer.includes('0.4%'));
    assert.deepEqual(result.pageReferences, [2]);
  });

  test('answerDocumentQuestion returns empty pageReferences when question is not answered by the document', async () => {
    const mockPages = [
      { pageNumber: 1, text: 'Company overview and disclaimer.' },
      { pageNumber: 2, text: 'Financial summary for fiscal year.' }
    ];

    const result = await answerDocumentQuestion({
      documentTitle: 'Financial Metrics',
      pages: mockPages,
      question: 'unanswered question about quantum entanglement'
    });

    assert.ok(result.answer.includes('does not provide enough information'));
    assert.deepEqual(result.pageReferences, []);
  });
});
