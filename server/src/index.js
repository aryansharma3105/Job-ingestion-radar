import { createApp } from './app.js';
import { config } from './config.js';
import { getDatabase } from './db/database.js';
import { startScheduler } from './ingestion/scheduler.js';

const app = createApp();

// Ensure DB initialized
getDatabase();

// Start background cron ingestion scheduler
startScheduler();

app.listen(config.port, () => {
  console.log(`==================================================`);
  console.log(`🚀 Job Ingestion Server running on port ${config.port}`);
  console.log(`📡 Target Source URL: ${config.jobSourceUrl}`);
  console.log(`⏱️ Ingestion Interval: Every ${config.ingestIntervalMinutes} minutes`);
  console.log(`💾 Database Path: ${config.databasePath}`);
  console.log(`==================================================`);
});
