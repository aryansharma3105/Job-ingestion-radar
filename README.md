# Job Ingestion Monitor — Acdyon Technologies Frontend Challenge (Part 1)

A complete, production-ready **Job Listing Ingestion Pipeline & Engineering Dashboard** built for the Acdyon Technologies Frontend Challenge.

The system continuously ingests real remote job listings from a permitted public source (**Remotive API**), normalizes incoming records into a standardized schema, handles transient HTTP errors and rate limits with exponential backoff, prevents duplicate entries, and presents a live monitoring dashboard built with React and Tailwind CSS.

---

## 🏗 Architecture Diagram

```
+-------------------------------------------------------------+
|                  PUBLIC JOB SOURCE                          |
|         (Remotive API: remotive.com/api/remote-jobs)        |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                    INGESTION ENGINE                         |
|  +-------------------------------------------------------+  |
|  | - Request Timeout (AbortController 10s)               |  |
|  | - Retry with Exponential Backoff (Max 3, 1s/2s/4s)   |  |
|  | - Rate-Limit Handling (HTTP 429 Retry-After)          |  |
|  | - Source Adapter (Isolated parsing)                   |  |
|  | - Normalizer & Zod Validation                         |  |
|  | - Deduplication (INSERTED vs UPDATED vs SKIPPED)      |  |
|  | - Empty Response Guard (SUSPICIOUS_EMPTY)             |  |
|  +-------------------------------------------------------+  |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                    SQLITE DATABASE                          |
|            (`jobs` & `ingestion_runs` tables)               |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                    EXPRESS REST API                         |
|       (`/api/jobs`, `/api/ingest`, `/api/ingest/status`)    |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                     REACT DASHBOARD                         |
|     (System Monitor, Source Health, Search, History Log)    |
+-------------------------------------------------------------+
```

---

## 📡 Data Source & Compliance Policy

- **Primary Source**: Remotive Public Remote Jobs API
- **Endpoint**: `https://remotive.com/api/remote-jobs`
- **Configurable**: Configured via environment variable `JOB_SOURCE_URL`
- **Compliance Policy**: This project strictly uses permitted public APIs and RSS feeds. It **does NOT** scrape LinkedIn, Indeed, or private accounts, nor does it bypass CAPTCHA, authentication, or anti-bot access controls.

---

## ✨ Features

- 🔄 **Real Job Ingestion**: Requests real remote job listings and normalizes them into a unified SQL schema.
- ⚡ **Precise Deduplication**: Compound key `(source, external_id)` with granular tracking (`INSERTED`, `UPDATED`, `DUPLICATE_SKIPPED`).
- 🛡 **Resilience & Backoff**: AbortController timeouts and 3-attempt exponential backoff retries for transient errors (429, 50x, network timeouts).
- 🚨 **Stale-Data Outage Fallback**: If the external source becomes unavailable, the system serves stored listings from database cache and displays a stale-data alert banner (`Source unavailable — displaying previously stored jobs.`).
- 📊 **Source Health Card**: Real-time operational status, response duration, retry count, and health state (`OPERATIONAL` vs `DEGRADED`).
- 🔍 **Search & Filters**: Search title/company/description with dropdown filters for category, location, and job type.
- 📜 **Ingestion Run History**: Structured audit log table tracking every background and manual run (`Run ID`, `Timestamp`, `Status`, `Fetched`, `Inserted`, `Updated`).
- 📱 **Fully Responsive Layout**: Built with Tailwind CSS, tested across mobile (390px) and desktop (1440px) without horizontal scrolling.

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js**: v18.x or higher (tested on Node v24)
- **npm**: v9.x or higher

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/acdycon-job-ingestion.git
cd acdycon-job-ingestion

# Install dependencies for both server and client
npm run install:all
```

### 2. Environment Configuration

Copy the example environment file in server directory:

```bash
# Copy env example
cp server/.env.example server/.env
```

Default contents:
```env
PORT=5000
NODE_ENV=development
JOB_SOURCE_URL=https://remotive.com/api/remote-jobs
INGEST_INTERVAL_MINUTES=30
DATABASE_PATH=./jobs.db
```

### 3. Run Development Servers

Run backend server and frontend client concurrently:

```bash
# In Terminal 1 (Backend Server)
npm run dev:server

# In Terminal 2 (Frontend React App)
npm run dev:client
```

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Running Automated Tests

Run the backend test suite covering ingestion logic, resilience retries, deduplication, and REST API endpoints:

```bash
npm run test:server
```

---

## 🔌 API Endpoints

### 1. `GET /api/jobs`
Retrieves paginated, filterable job listings.
- **Query Parameters**:
  - `page` (default `1`)
  - `limit` (default `20`, max `100`)
  - `search` (text query on title, company, description)
  - `location` (filter string e.g. `Remote`, `USA`)
  - `category` (category string)
  - `jobType` (e.g. `full_time`, `contract`)

### 2. `POST /api/ingest`
Manually triggers an immediate ingestion run.
- **Returns**: Ingestion run summary (`runId`, `status`, `jobsFetched`, `jobsInserted`, `jobsUpdated`, `duplicatesSkipped`, `invalidRecords`, `durationMs`).

### 3. `GET /api/ingest/status`
Returns ingestion system metrics, source health state (`OPERATIONAL` vs `DEGRADED`), data freshness timestamp, and recent run logs.

### 4. `GET /api/health`
System health check endpoint returning database connectivity, stored jobs count, uptime, and configuration.

---

## ☁️ Deployment Guide

### Backend (Render / Railway)
1. Connect repository to **Render** or **Railway** as a Web Service.
2. Build Command: `cd server && npm install`
3. Start Command: `cd server && npm start`
4. Set Environment Variables (`JOB_SOURCE_URL`, `PORT=5000`, `DATABASE_PATH=/data/jobs.db`).
5. **Disk Mounting Note**: For persistent SQLite storage across deployments on Render, attach a Persistent Disk mounted at `/data`. Alternatively, configure a hosted PostgreSQL database URL for multi-region serverless deployments.

### Frontend (Vercel / Netlify)
1. Import `client/` directory into **Vercel** or **Netlify**.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## 📄 Key Documentation

- [**DECISIONS.md**](./DECISIONS.md): Architectural decisions, trade-offs, and AI tool usage transparency.
- [**INGESTION_DESIGN.md**](./docs/INGESTION_DESIGN.md): Technical deep-dive on detection surface analysis, source adapter isolation, resilience retries, and ToS compliance boundaries.
