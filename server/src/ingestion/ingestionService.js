import { fetchWithRetry } from './retry.js';
import { validateNormalizedJob } from './normalizer.js';
import { getDatabase } from '../db/database.js';
import { RemotiveJobSource } from './sources/remotiveSource.js';
import { config } from '../config.js';

/**
 * Ingestion Service
 * Handles the complete lifecycle of fetching, validating, normalizing, deduplicating,
 * and persisting jobs into SQLite database using node:sqlite DatabaseSync with detailed metric logging.
 */
export class IngestionService {
  constructor(sourceAdapter = new RemotiveJobSource(config.jobSourceUrl)) {
    this.sourceAdapter = sourceAdapter;
  }

  /**
   * Executes an ingestion run.
   * @param {object} options Override options like sourceUrl
   * @returns {Promise<object>} Run summary object
   */
  async runIngestion(options = {}) {
    const db = getDatabase();
    const sourceUrl = options.sourceUrl || this.sourceAdapter.url || config.jobSourceUrl;
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    let retryCount = 0;
    let responseTimeMs = 0;
    let rawJobs = [];
    let jobsFetched = 0;
    let jobsInserted = 0;
    let jobsUpdated = 0;
    let duplicatesSkipped = 0;
    let invalidRecords = 0;

    try {
      // 1. Fetch raw data with retry & backoff
      const fetchResult = await fetchWithRetry(sourceUrl);
      responseTimeMs = fetchResult.responseTimeMs;
      retryCount = fetchResult.retryCount;

      // 2. Parse raw job items via source adapter
      rawJobs = this.sourceAdapter.parseRawJobs(fetchResult.payload);
      jobsFetched = rawJobs.length;

      // 3. Handle Empty Response Protection (SUSPICIOUS_EMPTY)
      if (jobsFetched === 0) {
        const finishedAt = new Date().toISOString();
        const durationMs = Date.now() - startTime;
        const status = 'SUSPICIOUS_EMPTY';
        const errorMessage = 'Source returned 0 job listings unexpectedly. Existing database records preserved.';

        this._logRun(db, {
          runId,
          source: this.sourceAdapter.sourceName,
          startedAt,
          finishedAt,
          durationMs,
          status,
          jobsFetched: 0,
          jobsInserted: 0,
          jobsUpdated: 0,
          duplicatesSkipped: 0,
          invalidRecords: 0,
          retryCount,
          errorMessage
        });

        return {
          runId,
          source: this.sourceAdapter.sourceName,
          startedAt,
          finishedAt,
          durationMs,
          status,
          jobsFetched: 0,
          jobsInserted: 0,
          jobsUpdated: 0,
          duplicatesSkipped: 0,
          invalidRecords: 0,
          retryCount,
          errorMessage,
          responseTimeMs
        };
      }

      // Prepare database statements
      const selectExistingStmt = db.prepare(
        `SELECT id, title, company, location, job_type, category, description, url, published_at 
         FROM jobs WHERE source = ? AND external_id = ?`
      );

      const insertStmt = db.prepare(
        `INSERT INTO jobs (source, external_id, title, company, location, job_type, category, description, url, published_at, fetched_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      const updateStmt = db.prepare(
        `UPDATE jobs SET 
           title = ?, company = ?, location = ?, job_type = ?, category = ?, description = ?, url = ?, published_at = ?, fetched_at = ?, updated_at = ?
         WHERE source = ? AND external_id = ?`
      );

      const nowIso = new Date().toISOString();

      db.exec('BEGIN TRANSACTION');
      try {
        for (const rawJob of rawJobs) {
          try {
            // Normalize via adapter
            const normalizedCandidate = this.sourceAdapter.normalize(rawJob);

            // Validate schema via Zod
            const validation = validateNormalizedJob(normalizedCandidate);
            if (!validation.valid) {
              invalidRecords++;
              console.warn(`[Ingestion] Invalid record skipped: ${validation.error}`);
              continue;
            }

            const job = validation.data;

            // Check if job already exists in database
            const existing = selectExistingStmt.get(job.source, job.externalId);

            if (!existing) {
              // 1. INSERTED
              insertStmt.run(
                job.source,
                job.externalId,
                job.title,
                job.company,
                job.location || null,
                job.jobType || null,
                job.category || null,
                job.description || null,
                job.url,
                job.publishedAt || null,
                nowIso,
                nowIso,
                nowIso
              );
              jobsInserted++;
            } else {
              // Compare fields to decide if UPDATED or DUPLICATE_SKIPPED
              const hasChanged =
                existing.title !== job.title ||
                existing.company !== job.company ||
                (existing.location || null) !== (job.location || null) ||
                (existing.job_type || null) !== (job.jobType || null) ||
                (existing.category || null) !== (job.category || null) ||
                (existing.description || null) !== (job.description || null) ||
                existing.url !== job.url ||
                (existing.published_at || null) !== (job.publishedAt || null);

              if (hasChanged) {
                // 2. UPDATED
                updateStmt.run(
                  job.title,
                  job.company,
                  job.location || null,
                  job.jobType || null,
                  job.category || null,
                  job.description || null,
                  job.url,
                  job.publishedAt || null,
                  nowIso,
                  nowIso,
                  job.source,
                  job.externalId
                );
                jobsUpdated++;
              } else {
                // 3. DUPLICATE_SKIPPED
                duplicatesSkipped++;
              }
            }
          } catch (err) {
            invalidRecords++;
            console.warn(`[Ingestion] Error normalizing raw record: ${err.message}`);
          }
        }
        db.exec('COMMIT');
      } catch (txnError) {
        db.exec('ROLLBACK');
        throw txnError;
      }

      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;
      const status = invalidRecords > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS';

      this._logRun(db, {
        runId,
        source: this.sourceAdapter.sourceName,
        startedAt,
        finishedAt,
        durationMs,
        status,
        jobsFetched,
        jobsInserted,
        jobsUpdated,
        duplicatesSkipped,
        invalidRecords,
        retryCount,
        errorMessage: null
      });

      return {
        runId,
        source: this.sourceAdapter.sourceName,
        startedAt,
        finishedAt,
        durationMs,
        status,
        jobsFetched,
        jobsInserted,
        jobsUpdated,
        duplicatesSkipped,
        invalidRecords,
        retryCount,
        errorMessage: null,
        responseTimeMs
      };
    } catch (error) {
      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;
      const status = 'FAILED';
      const errorMessage = error.message;

      this._logRun(db, {
        runId,
        source: this.sourceAdapter.sourceName,
        startedAt,
        finishedAt,
        durationMs,
        status,
        jobsFetched,
        jobsInserted: 0,
        jobsUpdated: 0,
        duplicatesSkipped: 0,
        invalidRecords: 0,
        retryCount,
        errorMessage
      });

      return {
        runId,
        source: this.sourceAdapter.sourceName,
        startedAt,
        finishedAt,
        durationMs,
        status,
        jobsFetched,
        jobsInserted: 0,
        jobsUpdated: 0,
        duplicatesSkipped: 0,
        invalidRecords: 0,
        retryCount,
        errorMessage,
        responseTimeMs
      };
    }
  }

  _logRun(db, runData) {
    try {
      const stmt = db.prepare(
        `INSERT INTO ingestion_runs (
          run_id, source, started_at, finished_at, duration_ms, status,
          jobs_fetched, jobs_inserted, jobs_updated, duplicates_skipped,
          invalid_records, retry_count, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        runData.runId,
        runData.source,
        runData.startedAt,
        runData.finishedAt,
        runData.durationMs,
        runData.status,
        runData.jobsFetched,
        runData.jobsInserted,
        runData.jobsUpdated,
        runData.duplicatesSkipped,
        runData.invalidRecords,
        runData.retryCount,
        runData.errorMessage
      );
    } catch (err) {
      console.error('[IngestionService] Failed to record run in ingestion_runs log:', err);
    }
  }
}
