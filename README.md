# PRANPAN &mdash; AI-Powered PDF Summarizer & Document Assistant

> **Phase 0: Architectural Foundation & Monorepo Bootstrap**

PRANPAN is an editorial-grade, production-ready AI document assistant built on the MERN stack (MongoDB, Express, React, Node.js) with Google Gemini AI.

This repository establishes the Phase 0 foundation: a clean monorepo architecture, isolated client/server layers, resilient Mongoose connection handling, centralized API client and error handling, and an editorial-minimal design token system.

---

## 🏛 System Architecture Overview

```
PRANPAN/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/             # Static brand assets
│   │   ├── components/         # Reusable UI components (Button, Card, StatusPill, Header)
│   │   ├── context/            # React context barrel (Phase 2 Auth reservation)
│   │   ├── hooks/              # Custom React hooks (useHealthCheck)
│   │   ├── layouts/            # Global page layouts (RootLayout)
│   │   ├── pages/              # Application views (OverviewPage, NotFoundPage)
│   │   ├── services/           # Centralized Axios client & API services
│   │   ├── styles/             # Design tokens & Tailwind entry (tokens.css, index.css)
│   │   ├── utils/              # Client constants and formatters
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx            # Application entry point
│   ├── .env.example            # Client environment template
│   ├── index.html              # HTML shell with Inter & Newsreader typography
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js      # Editorial-minimal design tokens
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express ES Modules)
│   ├── src/
│   │   ├── config/             # Environment validation & Mongoose connection manager
│   │   ├── controllers/        # Request handlers (healthController)
│   │   ├── middleware/         # Error handler, 404 handler, request logger
│   │   ├── models/             # Mongoose schemas registry (Phase 1 & 2 reserve)
│   │   ├── routes/             # API routes (healthRoutes, index)
│   │   ├── services/           # Business logic services (Phase 1 Gemini reserve)
│   │   ├── utils/              # ApiResponse, ApiError, safe logger
│   │   ├── validators/         # Request validation utilities
│   │   ├── app.js              # Express app setup (Helmet, CORS, JSON, compression)
│   │   └── server.js           # Server lifecycle & graceful shutdown
│   ├── .env.example            # Server environment template
│   ├── package.json
│   └── eslint.config.js
│
├── .env.example                # Root environment overview
├── .gitignore                  # Git ignore rules (node_modules, .env, caches)
├── .prettierrc                 # Code formatting rules
├── package.json                # Monorepo root scripts & dev orchestrator
└── README.md                   # Project documentation
```

---

## 🎨 Visual Identity & Design Tokens

PRANPAN uses a **premium editorial-minimal** aesthetic inspired by modern literary publications and minimalist developer tools:

| Token Category            | Specification        | Hex / Value                    | Purpose                               |
| :------------------------ | :------------------- | :----------------------------- | :------------------------------------ |
| **Canvas Background**     | Warm Off-White       | `#F8F6F1` (`warm-100`)         | Soft, reading-friendly backdrop       |
| **Primary Text / Action** | Deep Navy            | `#0B1524` (`navy-900`)         | High contrast, authoritative tone     |
| **Accent Color**          | Muted Blue           | `#2253AC` (`accent-600`)       | Restrained interactive signals        |
| **Secondary Surface**     | Subtle Warm Gray     | `#F2EFE8` (`surface-subtle`)   | Secondary cards & nested sections     |
| **Borders**               | Restrained Warm Gray | `#E5E0D6` (`surface-border`)   | Clean structural separation           |
| **Typography (Sans)**     | Inter                | `font-sans`                    | Clean UI controls, metrics, badges    |
| **Typography (Serif)**    | Newsreader           | `font-serif`                   | Editorial titles & document summaries |
| **Typography (Mono)**     | JetBrains Mono       | `font-mono`                    | Tokens, status codes, technical meta  |
| **Shadows**               | Restrained Subtle    | `shadow-subtle`, `shadow-card` | Tactile depth without heavy blur      |

---

## 🚀 Quickstart & Installation

### Prerequisites

- **Node.js**: `v18.0.0` or higher (verified on `v20.20.2`)
- **npm**: `v9.0.0` or higher (verified on `10.8.2`)

### 1. Install Dependencies

Run the installation orchestrator from the project root to install root, backend, and frontend packages:

```bash
npm run install:all
```

_(Or install manually in each directory: `npm install`, `cd server && npm install`, `cd ../client && npm install`)_

### 2. Configure Environment Variables

Copy the `.env.example` templates to `.env`:

```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

#### Default Development Values:

- **Server (`server/.env`)**:
  - `PORT=5000`
  - `NODE_ENV=development`
  - `CLIENT_ORIGIN=http://localhost:5173`
  - `MONGO_URI=` _(Optional for Phase 0 local bootstrap; server automatically runs in resilient disconnected mode if omitted)_
- **Client (`client/.env`)**:
  - `VITE_API_URL=http://localhost:5000/api`

---

## 💻 Running the Application

### Start Both Frontend and Backend Concurrently

From the root directory:

```bash
npm run dev
```

This starts:

- **Backend API**: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)
- **Frontend Client**: `http://localhost:5173`

### Run Services Individually

```bash
# Backend only
npm run dev:server

# Frontend only
npm run dev:client
```

---

## 🔍 Verification & Quality Assurance

### 1. Production Frontend Build

```bash
npm run build
```

Generates an optimized bundle in `client/dist/`.

### 2. Linting & Code Quality

```bash
# Lint both client and server
npm run lint

# Or individually
npm run lint:server
npm run lint:client

# Code formatting check
npm run format
```

### 3. API Health Verification

With the server running, inspect the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected Response:

```json
{
  "success": true,
  "message": "PRANPAN API service is healthy and operational",
  "data": {
    "status": "ok",
    "service": "pranpan-api",
    "version": "0.1.0",
    "timestamp": "2026-11-11T09:15:00.000Z",
    "uptimeSeconds": 42,
    "environment": "development",
    "database": {
      "status": "not_configured",
      "connected": false
    }
  }
}
```

---

## 🛡 Security Architecture Highlights

- **Strict Origin Whitelisting**: CORS rejects unlisted browser origins and disallows wildcard origins in production.
- **Security Headers**: Powered by `helmet` with sensible defaults.
- **Body Size Caps**: Enforces `10mb` limits on incoming JSON payloads.
- **Secret Isolation**: Frontend code bundle only has access to variables explicitly prefixed with `VITE_`. All database connection strings and Gemini API keys remain strictly confined to the backend environment.
- **Graceful Lifecycle Management**: Clean server shutdown listeners for `SIGINT` and `SIGTERM` ensure existing HTTP sockets drain and database connections close safely.

---

## 🗺 Implementation Roadmap

- [x] **Phase 0: Architectural Foundation** (Monorepo, Express ES modules, React + Vite, Tailwind tokens, API client, resilient DB layer)
- [x] **Phase 1: Complete UI/UX Development** (Editorial design system, responsive layouts, document workspace shell, upload interactions, reader UI)
- [x] **Phase 2: Authentication & Multi-Tenancy** (JWT, bcrypt, User model, session management, protected routes)
- [ ] **Phase 3: Document Processing & Gemini Pipeline** (PDF extraction, Gemini AI summarization, chat with document, export/reports)
