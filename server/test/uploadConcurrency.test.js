import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import express from 'express';
import {
  uploadConcurrencyGuard,
  handlePdfUpload,
  getActiveConcurrentUploads,
  resetActiveConcurrentUploads
} from '../src/middleware/uploadMiddleware.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('Upload Concurrency Guard Unit & Load Tests', () => {
  let server;
  let baseUrl;
  let delayReleaseResolvers = [];

  const validPdfBytes =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';

  before(async () => {
    resetActiveConcurrentUploads();

    const app = express();

    // Delayed route that simulates in-flight upload processing
    app.post(
      '/test-upload',
      uploadConcurrencyGuard,
      handlePdfUpload,
      async (req, res) => {
        // Wait on an external resolver to control concurrency precisely
        await new Promise((resolve) => {
          delayReleaseResolvers.push(resolve);
        });
        return res.status(200).json({ success: true, message: 'Upload processed' });
      }
    );

    // Instant route that completes immediately
    app.post(
      '/test-instant-upload',
      uploadConcurrencyGuard,
      handlePdfUpload,
      (req, res) => {
        return res.status(200).json({ success: true, message: 'Instant upload processed' });
      }
    );

    app.use(errorHandler);

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
    // Release any lingering holds
    delayReleaseResolvers.forEach((r) => r());
    resetActiveConcurrentUploads();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Counter increments on in-flight requests and rejects 6th simultaneous upload with 429', async () => {
    assert.equal(getActiveConcurrentUploads(), 0);
    delayReleaseResolvers = [];

    // Dispatch 5 concurrent upload requests that pause inside the handler
    const inFlightPromises = [];
    for (let i = 0; i < 5; i++) {
      const formData = new FormData();
      const file = new Blob([validPdfBytes], { type: 'application/pdf' });
      formData.append('file', file, `file-${i}.pdf`);

      const p = fetch(`${baseUrl}/test-upload`, {
        method: 'POST',
        body: formData
      });
      inFlightPromises.push(p);
    }

    // Yield brief tick for server to process initial multipart bytes
    await new Promise((res) => setTimeout(res, 80));

    // Verify counter reached exactly 5
    assert.equal(getActiveConcurrentUploads(), 5);

    // 6th upload must be immediately rejected with 429 Too Many Requests
    const formData6 = new FormData();
    const file6 = new Blob([validPdfBytes], { type: 'application/pdf' });
    formData6.append('file', file6, 'file-6.pdf');

    const res6 = await fetch(`${baseUrl}/test-upload`, {
      method: 'POST',
      body: formData6
    });

    assert.equal(res6.status, 429);
    const body6 = await res6.json();
    assert.equal(body6.error.code, 'SERVER_UPLOADS_BUSY');

    // Release all 5 in-flight requests
    delayReleaseResolvers.forEach((r) => r());
    const responses = await Promise.all(inFlightPromises);
    for (const r of responses) {
      assert.equal(r.status, 200);
    }

    // Yield for response close events to decrement counter
    await new Promise((res) => setTimeout(res, 50));

    // Counter must reset back to 0
    assert.equal(getActiveConcurrentUploads(), 0);
  });

  test('2. Counter releases immediately on Multer validation error (invalid extension)', async () => {
    assert.equal(getActiveConcurrentUploads(), 0);

    const formData = new FormData();
    const fakeFile = new Blob(['Not a pdf'], { type: 'text/plain' });
    formData.append('file', fakeFile, 'test.txt');

    const res = await fetch(`${baseUrl}/test-instant-upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 400);
    await new Promise((res) => setTimeout(res, 30));
    assert.equal(getActiveConcurrentUploads(), 0);
  });

  test('3. Counter releases immediately on duplicate payload rejection', async () => {
    assert.equal(getActiveConcurrentUploads(), 0);

    const formData = new FormData();
    const fileA = new Blob([validPdfBytes], { type: 'application/pdf' });
    const fileB = new Blob([validPdfBytes], { type: 'application/pdf' });
    formData.append('file', fileA, 'doc1.pdf');
    formData.append('pdf', fileB, 'doc2.pdf');

    const res = await fetch(`${baseUrl}/test-instant-upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 400);
    await new Promise((res) => setTimeout(res, 30));
    assert.equal(getActiveConcurrentUploads(), 0);
  });

  test('4. Counter resets and allows subsequent successful uploads after releases', async () => {
    assert.equal(getActiveConcurrentUploads(), 0);

    const formData = new FormData();
    const file = new Blob([validPdfBytes], { type: 'application/pdf' });
    formData.append('file', file, 'final.pdf');

    const res = await fetch(`${baseUrl}/test-instant-upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    await new Promise((res) => setTimeout(res, 30));
    assert.equal(getActiveConcurrentUploads(), 0);
  });
});
