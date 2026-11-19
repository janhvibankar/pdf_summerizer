# PRANPAN — Production Deployment Guide

This guide details the complete deployment procedure for **PRANPAN**, an AI-powered PDF summarizer and document assistant.

---

## 1. System Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │             CLIENT (SPA)                │
                      │  Hosted on: Vercel (Edge CDN)           │
                      │  Tech: React 18, Vite, Tailwind CSS     │
                      │  Routing: React Router (Client Rewrites)│
                      └────────────────────┬────────────────────┘
                                           │
                                           │ HTTPS + CORS (Credentials: include)
                                           │ SameSite=None; Secure Cookies
                                           │ X-CSRF-Token (Double Submit)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │             BACKEND API                 │
                      │  Hosted on: Render (Web Service)        │
                      │  Tech: Node.js, Express (ES Modules)    │
                      │  Reverse Proxy: trust proxy (1)         │
                      └─────────────┬─────────────────┬─────────┘
                                    │                 │
                Mongoose / TLS      │                 │  @google/genai SDK (v2)
                (Port 27017)        │                 │  (HTTPS Port 443)
                                    ▼                 ▼
          ┌───────────────────────────┐    ┌───────────────────────────┐
          │      DATABASE LAYER       │    │         AI LAYER          │
          │  MongoDB Atlas (M0/Serverless) │  Google Gemini API       │
          │  Collections:             │    │  Models:                  │
          │  - users                  │    │  - gemini-3.5-flash       │
          │  - documents              │    │  - gemini-3.8-flash       │
          │  - summaries              │    │  Backend-only key         │
          │  - conversations          │    └───────────────────────────┘
          └───────────────────────────┘
```

---

## 2. Environment Variables Specification

### A. Backend (`server/.env` / Render Environment Variables)

| Variable | Required | Production Example | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enforces production security checks, strict origin matching, and Secure cookies. |
| `PORT` | **Yes** | `10000` | Server listen port. Render automatically injects `PORT=10000`. |
| `CLIENT_ORIGIN` | **Yes** | `https://pranpan.vercel.app` | Allowed client origin(s) for CORS and CSRF validation. For multiple domains, use comma separation: `https://pranpan.vercel.app,https://pranpan.com`. Wildcards (`*`) are rejected. |
| `MONGO_URI` | **Yes** | `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/pranpan?retryWrites=true&w=majority` | Connection string to MongoDB Atlas. Backend-only. |
| `JWT_SECRET` | **Yes** | `[random 32+ character string]` | Signing key for JWT session tokens. Must be >= 32 characters in production. Generate via `openssl rand -base64 32`. |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration (default: `7d`). |
| `COOKIE_SAME_SITE` | **Yes** | `none` | Cross-site cookie attribute. In decoupled Vercel + Render setups, modern browsers require `none` with `Secure=true`. |
| `GEMINI_API_KEY` | **Yes** | `AIzaSy...` | Google Gemini API key from Google AI Studio. Backend-only. Never expose to client. |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Active Gemini model identifier (default: `gemini-3.5-flash`). |
| `MAX_PDF_SIZE_MB` | No | `15` | Maximum allowed PDF upload size in megabytes (default: `15`). |
| `MAX_PDF_PAGES` | No | `100` | Maximum pages extracted per PDF (default: `100`). |
| `FILE_STORAGE_PROVIDER` | No | `local` | `local` (disk) or `cloudinary` (cloud object storage). |
| `UPLOADS_DIR` | No | `/var/data/uploads` | Path to persistent disk mount point on Render (if using Render Disks). |
| `CLOUDINARY_CLOUD_NAME` | Conditional | `your-cloud-name` | Required only if `FILE_STORAGE_PROVIDER=cloudinary`. |
| `CLOUDINARY_API_KEY` | Conditional | `1234567890` | Required only if `FILE_STORAGE_PROVIDER=cloudinary`. |
| `CLOUDINARY_API_SECRET` | Conditional | `secret_token` | Required only if `FILE_STORAGE_PROVIDER=cloudinary`. |

### B. Frontend (`client/.env` / Vercel Environment Variables)

| Variable | Required | Production Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `https://pranpan-api.onrender.com/api` | Full URL to the backend `/api` endpoint. Embedded into bundle at build time. |

> [!WARNING]
> In Vite, only variables prefixed with `VITE_` are exposed to the browser. **NEVER** add `MONGO_URI`, `JWT_SECRET`, or `GEMINI_API_KEY` to Vercel or `client/.env`.

---

## 3. Persistent File Storage Considerations

On Render:
- **Free/Standard Web Services have ephemeral filesystems**: Local disk writes are wiped whenever the service restarts, scales, or redeploys.
- **Document Metadata & Chunks are Persisted in MongoDB**: Uploaded document records, extracted full text, segmented chunks, and summaries remain safely persisted in Atlas even if the raw PDF binary is wiped.
- **Production Storage Options**:
  1. **Render Persistent Disk (Recommended for Single Instance)**:
     - On Render Dashboard, attach a Disk (e.g., Mount Path `/var/data/uploads`, Size 10GB).
     - Set environment variable: `UPLOADS_DIR=/var/data/uploads`.
     - Cost: Requires a paid Render instance ($7/mo starter + $0.25/GB/mo disk).
  2. **Cloudinary Private Storage (Recommended for Multi-Instance / Scaled Deployments)**:
     - Set `FILE_STORAGE_PROVIDER=cloudinary`.
     - Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
  3. **Local Ephemeral (Free Tier Development / Testing)**:
     - Default setting (`FILE_STORAGE_PROVIDER=local`, `UPLOADS_DIR` empty).
     - PDFs are stored in server `uploads/` directory. Suitable for testing, but files will not survive instance replacement.

---

## 4. Step-by-Step Deployment Instructions

### Step 1: Database Setup (MongoDB Atlas)

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new Cluster (Free M0 or Shared Tier).
3. **Network Access**:
   - Add IP Access List: Render dynamic IPs require allowing access from anywhere (`0.0.0.0/0`).
4. **Database Access**:
   - Create a dedicated database user (e.g. `pranpan_app`) with `readWriteAnyDatabase` or scoped read/write access to `pranpan` database.
5. **Get Connection String**:
   - Click **Connect** → **Drivers** (Node.js).
   - Copy connection string: `mongodb+srv://pranpan_app:<password>@cluster0.xxxx.mongodb.net/pranpan?retryWrites=true&w=majority`.

### Step 2: AI Setup (Google Gemini API)

1. Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Generate an API Key.
3. Test key using the included verification script:
   ```bash
   GEMINI_API_KEY=your_key node server/scripts/verifyLiveGemini.js
   ```

### Step 3: Backend Deployment (Render)

#### Option A: 1-Click Blueprint (Recommended)
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), click **New** → **Blueprint**.
3. Connect your repository. Render will automatically parse [render.yaml](file:///d:/projects/pdf%20summarizer/render.yaml).
4. Enter the required secret environment variables (`MONGO_URI`, `GEMINI_API_KEY`, `CLIENT_ORIGIN`).
5. Click **Apply**.

#### Option B: Manual Web Service
1. In Render Dashboard, click **New** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `pranpan-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. In the **Environment Variables** tab, add all required variables from Section 2A.
5. Click **Deploy Web Service**.
6. Note the deployed backend URL (e.g. `https://pranpan-api.onrender.com`).

### Step 4: Frontend Deployment (Vercel)

1. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** → **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. In the **Environment Variables** section:
   - Add `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`
5. Click **Deploy**.
6. Once deployed, copy your production Vercel URL (e.g. `https://pranpan.vercel.app`).
7. **Final Handshake**: Go back to Render Dashboard, update `CLIENT_ORIGIN` to match your Vercel URL (e.g. `https://pranpan.vercel.app`), and redeploy the backend.

---

## 5. Security & Verification Checklist

Before opening the application to users, execute this checklist:

- [ ] **Health Endpoint Check**:
  `curl -i https://<render-url>/api/health` returns HTTP 200 with `database.connected: true`.
- [ ] **Root Health Check**:
  `curl -i https://<render-url>/health` returns HTTP 200.
- [ ] **CORS Origin Check**:
  Request from unauthorized origin receives HTTP 403 Forbidden.
- [ ] **CSRF Verification**:
  `GET https://<render-url>/api/auth/csrf-token` sets `pranpan_csrf` with `SameSite=None; Secure`.
- [ ] **Registration & Authentication**:
  Register a test user from the Vercel frontend. Verify `pranpan_session` cookie is attached with `HttpOnly; SameSite=None; Secure`.
- [ ] **Document Ingestion & Summary**:
  Upload a sample PDF document. Verify short, medium, and detailed summaries render properly.
- [ ] **Document Chat**:
  Ask a question in chat and verify page citations link back to the document reader.
- [ ] **Session Expiration & Revocation**:
  Verify changing password or clicking logout clears the session cookie and invalidates the token.

---

## 6. Known Production Limitations (Pending Setup)

1. **MongoDB Atlas URI**: The repository currently operates in local disconnected mode. Setting `MONGO_URI` in production is required for user authentication and document persistence.
2. **Render Free Tier Spin-Down**: On Render's free tier, the web service spins down after 15 minutes of inactivity. The initial wake-up request may take ~50 seconds.
3. **Local Ephemeral Disk**: Unless a Render Persistent Disk is attached (`UPLOADS_DIR`) or Cloudinary credentials are provided, uploaded PDF binary files are temporary to the current container lifecycle.
