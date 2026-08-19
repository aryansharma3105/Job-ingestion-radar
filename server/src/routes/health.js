import { Router } from 'express';
import { getDatabase } from '../db/database.js';
import { config } from '../config.js';

const router = Router();

/**
 * GET /api/health
 * System health check endpoint.
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();

    const jobCount = db.prepare('SELECT COUNT(*) AS count FROM jobs').get().count;
    const runCount = db.prepare('SELECT COUNT(*) AS count FROM ingestion_runs').get().count;
    const lastRun = db.prepare('SELECT finished_at, status FROM ingestion_runs ORDER BY id DESC LIMIT 1').get();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'connected',
        path: config.databasePath
      },
      metrics: {
        totalJobsStored: jobCount,
        totalIngestionRuns: runCount,
        lastIngestionAt: lastRun ? lastRun.finished_at : null,
        lastIngestionStatus: lastRun ? lastRun.status : 'NONE'
      },
      config: {
        sourceUrl: config.jobSourceUrl,
        ingestIntervalMinutes: config.ingestIntervalMinutes
      }
    });
  } catch (error) {
    console.error('[GET /api/health] Error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
