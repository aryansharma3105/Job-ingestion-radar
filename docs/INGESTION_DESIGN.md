# Job Ingestion Pipeline Design & Detection Surface Specification

This document provides a comprehensive technical overview of the ingestion pipeline, resilience mechanisms, detection surface analysis, and Terms of Service (ToS) compliance boundaries for the **Acdyon Technologies Job Ingestion Monitor**.

---

## 1. Detection Surface & Safety Compliance

When operating automated data collection pipelines against external endpoints, security systems (WAFs, Cloudflare, Akamai, etc.) evaluate automated traffic across multiple detection dimensions:

### Detection Surface Vectors
1. **Request Frequency & Velocity**: Rapid, repetitive requests from the same IP trigger automated rate-limit rules.
2. **Abnormal Request Patterns**: Machine-like polling at exact sub-second intervals or non-stop concurrent looping.
3. **HTTP Header Signatures**: Default user-agent headers (e.g. `curl/7.68.0`, `python-requests`), missing `Accept` headers, or inconsistent header ordering.
4. **Session & Cookie Behavior**: Failure to store or pass valid session identifiers/cookies expected by stateful web applications.
5. **Browser Fingerprinting & TLS Handshakes**: Discrepancies between advertised browser User-Agent strings and lower-level TLS fingerprints (JA3/JA4).
6. **CAPTCHA & Access Controls**: Visual or JavaScript challenges presented when risk thresholds are breached.

### ToS & Ethical Ingestion Boundaries
> [!IMPORTANT]
> **No Anti-Bot Bypass Rule**: This project strictly adheres to legal and ethical data ingestion practices. It **does NOT** implement CAPTCHA solvers, stealth browser fingerprinting, credential automation, proxy rotation for ban evasion, or access-control bypasses.

Our engineering design addresses the detection surface by eliminating aggressive traffic entirely:
- **Permitted Public Source**: Uses Remotive's official public API (`https://remotive.com/api/remote-jobs`), specifically designed for legal job distribution.
- **Conservative Polling**: Background ingestion runs at conservative 30-minute intervals (`INGEST_INTERVAL_MINUTES=30`), avoiding high-frequency polling.
- **Standardized Headers**: Requests include explicit `User-Agent` and `Accept: application/json` headers.
- **Rate-Limit Respect (HTTP 429)**: Respects `Retry-After` headers and pauses requests rather than hammering endpoints.
- **Local Persistence & Caching**: All ingested data is stored in SQLite, allowing the Express API and React frontend to serve cached listings locally without hitting external servers.

---

## 2. Ingestion Pipeline Architecture & Source Isolation

```
           +---------------------------------+
           |   External Public Job Endpoint  |
           | (https://remotive.com/api/...) |
           +----------------+----------------+
                            |
                            v
           +----------------+----------------+
           |     HTTP Retry & Backoff        |
           | (AbortController, Max 3, 1/2/4s)|
           +----------------+----------------+
                            |
                            v
           +----------------+----------------+
           |    Source Adapter (Isolated)    |
           |    (server/.../remotiveSource)  |
           +----------------+----------------+
                            |
                            v
           +----------------+----------------+
           |  Normalizer & Zod Validation    |
           |  (Sanitizes dates, null fallback)|
           +----------------+----------------+
                            |
                            v
           +----------------+----------------+
           |    Deduplication & Sync Engine  |
           | (INSERTED, UPDATED, SKIPPED)    |
           +----------------+----------------+
                            |
                            v
           +----------------+----------------+
           |       SQLite Database           |
           |   (`jobs`, `ingestion_runs`)    |
           +---------------------------------+
```

### Source Isolation Pattern
To protect the application from external payload changes, all source-specific parsing logic is strictly encapsulated inside source adapter modules (`server/src/ingestion/sources/remotiveSource.js`).

The core ingestion engine (`IngestionService`) operates exclusively on normalized job instances conforming to the unified schema:

```typescript
interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string | null;
  jobType: string | null;
  category: string | null;
  description: string | null;
  url: string;
  publishedAt: string | null;
}
```

If Remotive or another provider changes its JSON field names, **only the source adapter class needs modification**.

---

## 3. Failure Resilience Mechanisms

The pipeline is built to handle network instability and edge cases without corrupting state or failing silently:

### 1. Request Timeout Protection
Every external fetch request is wrapped with an `AbortController` set to a 10-second hard limit. If the remote server hangs, the request aborts gracefully rather than locking worker threads.

### 2. Exponential Backoff Retry Strategy
Transient failures trigger up to **3 retry attempts** with exponential delays (1s, 2s, 4s). Retries execute **only** for transient status codes:
- `429 Too Many Requests`
- `500 Internal Server Error`
- `502 Bad Gateway`
- `503 Service Unavailable`
- `504 Gateway Timeout`
- Network timeouts (`AbortError`, `ETIMEDOUT`, `ECONNRESET`)

Permanent client errors (e.g. `404 Not Found`, `401 Unauthorized`, `403 Forbidden`) fail fast without retrying.

### 3. Malformed Data Guard
Each job item inside the incoming array is individually validated using `Zod` schemas. If a single job object has corrupt or missing fields (e.g. missing `id`, `title`, or `url`), that record is skipped, logged in `invalid_records`, and valid records in the payload are processed normally.

### 4. Empty Response Guard (`SUSPICIOUS_EMPTY`)
If an external endpoint unexpectedly returns an empty array (`jobs: []`), the system marks the run status as `SUSPICIOUS_EMPTY` and **preserves existing database records**. It does not wipe the database.

### 5. Stale Data Fallback (Source Outage Resilience)
If the external source suffers an outage (DNS failure, HTTP 5xx, timeout), the backend logs the failure in `ingestion_runs` and the system marks the source health state as `DEGRADED`. The Express API continues to serve the last successfully ingested job listings from SQLite, and the React frontend displays a prominent warning banner:
> **"Source unavailable — displaying previously stored jobs."**

---

## 4. Plan B Architecture

If the primary source (`Remotive API`) becomes permanently unavailable or alters its access terms:

1. **Adapter Swap**: Create a new source adapter (e.g. `server/src/ingestion/sources/rssSource.js` or `sandboxSource.js`) extending `BaseJobSource`.
2. **Environment Variable Configuration**: Change `JOB_SOURCE_URL` in `.env`.
3. **Zero Core Pipeline Modifications**: The normalization, validation, database deduplication, Express routes, and React UI remain 100% unchanged.
