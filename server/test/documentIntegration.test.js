import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Document } from '../src/models/Document.js';
import { Summary } from '../src/models/Summary.js';
import { Conversation } from '../src/models/Conversation.js';
import { setGeminiInvoker } from '../src/services/geminiService.js';
import { signToken } from '../src/utils/token.js';

describe('Document Ingestion, Processing & Gemini AI Integration Tests', () => {
  let server;
  let baseUrl;

  // In-memory data collections
  const usersDb = new Map();
  const documentsDb = new Map();
  const summariesDb = new Map();
  const conversationsDb = new Map();

  let userA;
  let userB;
  let tokenA;
  let tokenB;

  // Original methods
  const originalUserFindById = User.findById;
  const originalDocCreate = Document.create;
  const originalDocFind = Document.find;
  const originalDocFindById = Document.findById;
  const originalDocFindByIdAndDelete = Document.findByIdAndDelete;
  const originalSumFindOneAndUpdate = Summary.findOneAndUpdate;
  const originalSumFindOne = Summary.findOne;
  const originalSumDeleteMany = Summary.deleteMany;
  const originalConvFindOne = Conversation.findOne;
  const originalConvDeleteMany = Conversation.deleteMany;

  before(async () => {
    // 1. Setup mock User documents
    userA = {
      _id: '670000000000000000000001',
      id: '670000000000000000000001',
      name: 'User Alpha',
      email: 'alpha@pranpan.com',
      role: 'user',
      tokenVersion: 0
    };
    userB = {
      _id: '670000000000000000000002',
      id: '670000000000000000000002',
      name: 'User Beta',
      email: 'beta@pranpan.com',
      role: 'user',
      tokenVersion: 0
    };
    usersDb.set(userA.id, userA);
    usersDb.set(userB.id, userB);

    tokenA = signToken({ id: userA.id, email: userA.email, role: userA.role, tokenVersion: 0 });
    tokenB = signToken({ id: userB.id, email: userB.email, role: userB.role, tokenVersion: 0 });

    User.findById = (id) => {
      const u = usersDb.get(String(id));
      const doc = u ? new User(u) : null;
      return {
        select: () => Promise.resolve(doc),
        then: (resolve) => Promise.resolve(doc).then(resolve)
      };
    };

    // 2. Setup mock Document operations
    Document.create = async (data) => {
      const doc = new Document(data);
      documentsDb.set(doc._id.toString(), doc);
      return doc;
    };

    Document.find = (query) => {
      let results = Array.from(documentsDb.values());
      if (query.userId) {
        results = results.filter((d) => d.userId.toString() === query.userId.toString());
      }
      return {
        sort: () => Promise.resolve(results),
        then: (resolve) => Promise.resolve(results).then(resolve)
      };
    };

    Document.findById = (id) => {
      const doc = documentsDb.get(String(id));
      return {
        select: () => Promise.resolve(doc),
        then: (resolve) => Promise.resolve(doc).then(resolve)
      };
    };

    Document.findByIdAndDelete = async (id) => {
      documentsDb.delete(String(id));
      return true;
    };

    // 3. Setup mock Summary operations
    Summary.findOneAndUpdate = async (query, update) => {
      const key = `${query.documentId}-${query.summaryType}`;
      const summaryData = {
        _id: `sum-${Date.now()}`,
        id: `sum-${Date.now()}`,
        ...query,
        ...update,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const sumDoc = new Summary(summaryData);
      summariesDb.set(key, sumDoc);
      return sumDoc;
    };

    Summary.findOne = async (query) => {
      const key = `${query.documentId}-${query.summaryType}`;
      return summariesDb.get(key) || null;
    };

    Summary.deleteMany = async (query) => {
      for (const [key, val] of summariesDb.entries()) {
        if (val.documentId.toString() === query.documentId.toString()) {
          summariesDb.delete(key);
        }
      }
      return { deletedCount: 1 };
    };

    // 4. Setup mock Conversation operations
    Conversation.prototype.save = async function () {
      const key = `${this.documentId}-${this.userId}`;
      conversationsDb.set(key, this);
      return this;
    };

    Conversation.findOne = async (query) => {
      const key = `${query.documentId}-${query.userId}`;
      return conversationsDb.get(key) || null;
    };

    Conversation.deleteMany = async (query) => {
      for (const [key, val] of conversationsDb.entries()) {
        if (val.documentId.toString() === query.documentId.toString()) {
          conversationsDb.delete(key);
        }
      }
      return { deletedCount: 1 };
    };

    // 5. Mock Gemini response to ensure deterministic testing without consuming quota
    setGeminiInvoker(async (prompt) => {
      if (prompt.includes('SYNTHESIS MODE')) {
        return JSON.stringify({
          executiveSummary: 'This document examines scalable renewable energy grid architectures.',
          keyTakeaways: [
            { id: 't-1', title: 'Solar Degradation', desc: 'Annual degradation decreased to 0.4%.' },
            { id: 't-2', title: 'Grid Storage', desc: 'Battery storage duration increased by 3.2 hours.' }
          ],
          sections: [
            { id: 's-1', title: 'Technology Overview', content: 'In-depth assessment of inverters.', pageRef: 'Page 1' }
          ]
        });
      }

      // Chat Q&A response
      return 'The solar degradation rate reported in the document is 0.4% annually [Page 1].';
    });

    // Start HTTP server on dynamic port
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    User.findById = originalUserFindById;
    Document.create = originalDocCreate;
    Document.find = originalDocFind;
    Document.findById = originalDocFindById;
    Document.findByIdAndDelete = originalDocFindByIdAndDelete;
    Summary.findOneAndUpdate = originalSumFindOneAndUpdate;
    Summary.findOne = originalSumFindOne;
    Summary.deleteMany = originalSumDeleteMany;
    Conversation.findOne = originalConvFindOne;
    Conversation.deleteMany = originalConvDeleteMany;
    setGeminiInvoker(null);

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  let csrfToken;
  let csrfCookie;
  let createdDocId;

  const validPdfBytes =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';

  test('0. Initialize CSRF token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/csrf-token`);
    assert.equal(res.status, 200);
    const body = await res.json();
    csrfToken = body.data.csrfToken;
    csrfCookie = res.headers.get('set-cookie').match(/pranpan_csrf=([^;]+)/)[0];
  });

  test('1. POST /api/documents/upload rejects non-PDF extension', async () => {
    const formData = new FormData();
    const fakeFile = new Blob(['Plain text file content'], { type: 'text/plain' });
    formData.append('file', fakeFile, 'document.txt');

    const res = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: formData
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('Only PDF files'));
  });

  test('2. POST /api/documents/upload rejects corrupted PDF buffer with invalid magic bytes', async () => {
    const formData = new FormData();
    const badFile = new Blob(['NOT_A_VALID_PDF_HEADER'], { type: 'application/pdf' });
    formData.append('file', badFile, 'corrupted.pdf');

    const res = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: formData
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('PDF signature'));
  });

  test('2b. POST /api/documents/upload rejects duplicate file payloads (both file and pdf)', async () => {
    const formData = new FormData();
    const validFileA = new Blob([validPdfBytes], { type: 'application/pdf' });
    const validFileB = new Blob([validPdfBytes], { type: 'application/pdf' });
    formData.append('file', validFileA, 'first.pdf');
    formData.append('pdf', validFileB, 'second.pdf');

    const res = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: formData
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.code === 'MULTIPLE_FILES_NOT_ALLOWED' || body.error.code === 'DUPLICATE_PAYLOAD_REJECTED');
  });

  test('2c. POST /api/documents/upload accepts single file submitted under legacy "pdf" field alias', async () => {
    const formData = new FormData();
    const validFile = new Blob([validPdfBytes], { type: 'application/pdf' });
    formData.append('pdf', validFile, 'legacy-alias.pdf');

    const res = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: formData
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.document.title, 'legacy alias');
  });

  test('3. POST /api/documents/upload ingests valid PDF, extracts text and stores Document record', async () => {
    const formData = new FormData();
    const validFile = new Blob([validPdfBytes], { type: 'application/pdf' });
    formData.append('file', validFile, 'Renewable Energy Strategy.pdf');

    const res = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: formData
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.document.title, 'Renewable Energy Strategy');
    assert.equal(body.data.document.pageCount, 1);
    assert.ok(body.data.document.id);

    createdDocId = body.data.document.id;
  });

  test('4. GET /api/documents returns user documents', async () => {
    const res = await fetch(`${baseUrl}/api/documents`, {
      headers: {
        Authorization: `Bearer ${tokenA}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(Array.isArray(body.data.documents), true);
    assert.ok(body.data.documents.length >= 1);
  });

  test('5. GET /api/documents/:id returns single document metadata', async () => {
    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.document.id, createdDocId);
    assert.equal(body.data.document.title, 'Renewable Energy Strategy');
  });

  test('6. Ownership Security: User B cannot access User A document (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}`, {
      headers: {
        Authorization: `Bearer ${tokenB}`
      }
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN_DOCUMENT_ACCESS');
  });

  test('7. POST /api/documents/:id/summarize generates structured summary and saves to DB', async () => {
    // Manually ensure document has extractable text for test
    const doc = documentsDb.get(createdDocId);
    doc.extractionStatus = 'completed';
    doc.extractedText = 'Section 1: The solar degradation rate is 0.4% annually across multi-megawatt systems.';
    doc.pages = [{ pageNumber: 1, text: doc.extractedText, wordCount: 15 }];

    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({ summaryType: 'medium' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.summary.summaryType, 'medium');
    assert.ok(body.data.summary.executiveSummary);
    assert.ok(body.data.summary.keyTakeaways.length > 0);
  });

  test('8. GET /api/documents/:id/summary retrieves saved summary', async () => {
    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}/summary?type=medium`, {
      headers: {
        Authorization: `Bearer ${tokenA}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.summary.summaryType, 'medium');
    assert.ok(body.data.summary.keyTakeaways.length > 0);
  });

  test('9. POST /api/documents/:id/chat answers grounded question with page citations', async () => {
    try {
      const res = await fetch(`${baseUrl}/api/documents/${createdDocId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-csrf-token': csrfToken,
          Cookie: csrfCookie,
          Origin: 'http://localhost:5173'
        },
        body: JSON.stringify({ question: 'What is the solar degradation rate?' })
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.answer.includes('0.4%'));
      assert.ok(Array.isArray(body.data.pageReferences));
    } catch (err) {
      console.error('DEBUG CAUSE TEST 9:', err.cause || err);
      throw err;
    }
  });

  test('10. GET /api/documents/:id/chat-history returns persistent message thread', async () => {
    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}/chat-history`, {
      headers: {
        Authorization: `Bearer ${tokenA}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.messages.length >= 2);
    assert.equal(body.data.messages[0].role, 'user');
    assert.equal(body.data.messages[1].role, 'assistant');
  });

  test('10b. GET /api/documents/:id/chat returns persistent message thread (alias route)', async () => {
    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}/chat`, {
      headers: {
        Authorization: `Bearer ${tokenA}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.messages.length >= 2);
    assert.equal(body.data.messages[0].role, 'user');
    assert.equal(body.data.messages[1].role, 'assistant');
  });

  test('11. DELETE /api/documents/:id removes document and associated records', async () => {
    const res = await fetch(`${baseUrl}/api/documents/${createdDocId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(documentsDb.has(createdDocId), false);
  });
});
