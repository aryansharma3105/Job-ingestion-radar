# Architectural Decisions & Engineering Rationale

This document answers the three key technical evaluation questions for the **Acdyon Technologies Frontend Challenge (Part 1)**.

---

### 1. Why this ingestion strategy over the obvious alternative you rejected?

For a job listing ingestion system, the "obvious alternative" is directly scraping major job boards like LinkedIn, Indeed, or Wellfound using headless browsers (Puppeteer/Playwright). 

I rejected direct scraping in favor of a **permitted public API + isolated Source Adapter pattern** for three critical engineering reasons:

1. **Legal & Terms of Service Compliance**: Protected commercial platforms explicitly prohibit automated scraping in their Terms of Service and deploy aggressive WAFs, CAPTCHAs, and IP rate limits. Engineering a system around CAPTCHA bypasses or stealth fingerprinting creates high legal risk and brittle architecture.
2. **Pipeline Stability & Maintenance Cost**: HTML scrapers break frequently whenever a target website updates its DOM structure or class names. Public JSON APIs (like Remotive) provide structured, versioned data contracts that guarantee long-term system reliability.
3. **Decoupled Architecture**: By building an isolated `SourceAdapter` interface, the ingestion pipeline is source-agnostic. Remotive is used as a low-risk public source for this challenge, but adding another public RSS feed or client endpoint requires creating a single adapter class without touching the core normalization, deduplication, database, or UI logic.

---

### 2. One trade-off made under the time limit, and what you would do with a real week.

**The Trade-off**: Using **SQLite** (`node:sqlite` built-in module) as the single-file database engine instead of a distributed PostgreSQL database setup.

*Why it was chosen*: SQLite allowed building a completely self-contained, zero-friction local and single-server application with zero external database provisioning or credential management required during evaluation.

**What I would do with a full engineering week**:
1. **Database Migration to PostgreSQL**: Replace SQLite with PostgreSQL (via Neon/Supabase or AWS RDS) using Prisma or Knex migrations to support multi-instance server deployments and concurrent writes.
2. **Distributed Queue System**: Decouple HTTP requests from ingestion processing using a Redis-backed job queue (BullMQ/Celery) with worker pools. This would allow processing hundreds of source feeds asynchronously.
3. **Multi-Source Aggregator & Schema Enrichment**: Expand source adapters to support RSS 2.0 / Atom feeds and implement LLM-based categorization to auto-tag salary ranges, remote region restrictions, and required skill sets.

---

### 3. Where did you use AI tools, and what did you personally verify or change afterward?

**AI Tool Usage**:
- AI assistance was used to generate initial React + Tailwind CSS dashboard boilerplate components, drafting Vitest test file skeletons, and formatting Markdown documentation templates.

**What was personally verified, debugged, and re-engineered**:
1. **Node v24 SQLite Engine**: When native C++ compilation of external SQLite packages failed on Windows with Node v24, I re-engineered the database layer to utilize Node's new native `node:sqlite` (`DatabaseSync`) module, ensuring zero native compilation errors and 100% standard SQL compliance.
2. **Deduplication Metric Precision**: I personally verified the atomic SQL transaction logic to enforce strict tri-state metric boundaries: `INSERTED` (new external ID), `UPDATED` (existing ID with modified fields), and `DUPLICATE_SKIPPED` (existing ID with identical data), eliminating double-counting.
3. **Resilience & Stale-Data Fallback**: Tested the exponential backoff retry loop against mock 429/500/timeout responses to verify that transient failures do not crash the process and that stale cached data is served seamlessly when external endpoints fail.
