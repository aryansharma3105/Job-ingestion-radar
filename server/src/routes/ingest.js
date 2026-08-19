import { Router } from 'express';
import { getDatabase } from '../db/database.js';
import { IngestionService } from '../ingestion/ingestionService.js';
import { config } from '../config.js';

const router = Router();
const ingestionService = new IngestionService();
let isIngestionRunning = false;

/**
 * POST /api/ingest
 * Manually trigger an ingestion run.
 */
router.post('/', async (req, res) => {
  if (isIngestionRunning) {
    return res.status(409).json({
      success: false,
      error: 'Ingestion is already running. Please wait for the current run to complete.'
    });
  }

  isIngestionRunning = true;
  try {
    const result = await ingestionService.runIngestion();
    isIngestionRunning = false;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    isIngestionRunning = false;
    console.error('[POST /api/ingest] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Ingestion failed'
    });
  }
});

/**
 * GET /api/ingest/status
 * Returns ingestion status, source health, data freshness, and recent run history.
 */
router.get('/status', (req, res) => {
  try {
    const db = getDatabase();

    // Fetch latest run
    const lastRun = db.prepare(`SELECT * FROM ingestion_runs ORDER BY id DESC LIMIT 1`).get();

    // Fetch latest successful run
    const lastSuccessRun = db.prepare(
      `SELECT * FROM ingestion_runs WHERE status IN ('SUCCESS', 'PARTIAL_SUCCESS') ORDER BY id DESC LIMIT 1`
    ).get();

    // Fetch recent 10 runs
    const recentRuns = db.prepare(`SELECT * FROM ingestion_runs ORDER BY id DESC LIMIT 10`).all();

    // Count total stored jobs
    const totalStoredJobs = db.prepare(`SELECT COUNT(*) AS count FROM jobs`).get().count;

    const source = config.jobSourceUrl;
    const lastSuccessfulIngestionAt = lastSuccessRun ? lastSuccessRun.finished_at : null;

    // Determine source health state (OPERATIONAL vs DEGRADED) based on actual metrics
    let healthState = 'OPERATIONAL';
    let healthDetails = {
      source,
      lastRequestTime: lastRun ? lastRun.started_at : null,
      lastSuccessfulIngestion: lastSuccessfulIngestionAt,
      jobsReturned: lastRun ? lastRun.jobs_fetched : 0,
      retryAttempts: lastRun ? lastRun.retry_count : 0
    };

    if (lastRun && (lastRun.status === 'FAILED' || lastRun.status === 'SUSPICIOUS_EMPTY')) {
      healthState = 'DEGRADED';
      healthDetails.message = lastRun.status === 'SUSPICIOUS_EMPTY' 
        ? 'Source returned zero listings — serving previously stored jobs.'
        : `Source unreachable (${lastRun.error_message}) — serving previously stored jobs.`;
    }

    res.json({
      success: true,
      data: {
        isIngestionRunning,
        sourceUrl: config.jobSourceUrl,
        sourceName: 'Remotive Public API',
        totalStoredJobs,
        lastRun,
        lastSuccessfulIngestionAt,
        sourceHealth: {
          state: healthState,
          ...healthDetails
        },
        recentRuns
      }
    });
  } catch (error) {
    console.error('[GET /api/ingest/status] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ingestion status'
    });
  }
});

export default router;
