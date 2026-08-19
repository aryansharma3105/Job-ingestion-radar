import cron from 'node-cron';
import { config } from '../config.js';
import { IngestionService } from './ingestionService.js';

let scheduledTask = null;

export function startScheduler(ingestionService = new IngestionService()) {
  const intervalMinutes = config.ingestIntervalMinutes;
  
  // Convert minutes to cron expression: e.g. every 30 minutes => '*/30 * * * *'
  const cronExpression = `*/${intervalMinutes} * * * *`;

  console.log(`[Scheduler] Initializing automated job ingestion every ${intervalMinutes} minutes (${cronExpression})`);

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log(`[Scheduler] Starting automated ingestion run at ${new Date().toISOString()}`);
    try {
      const result = await ingestionService.runIngestion();
      console.log(`[Scheduler] Completed run ${result.runId}: Status=${result.status}, Inserted=${result.jobsInserted}, Updated=${result.jobsUpdated}`);
    } catch (err) {
      console.error('[Scheduler] Automated ingestion failed:', err);
    }
  });

  return scheduledTask;
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[Scheduler] Background scheduler stopped');
  }
}
