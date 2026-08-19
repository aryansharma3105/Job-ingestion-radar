import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from server root or workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jobSourceUrl: process.env.JOB_SOURCE_URL || 'https://remotive.com/api/remote-jobs',
  ingestIntervalMinutes: parseInt(process.env.INGEST_INTERVAL_MINUTES || '30', 10),
  databasePath: process.env.DATABASE_PATH || './jobs.db',
  requestTimeoutMs: 10000, // 10s default timeout
  maxRetryAttempts: 3,
  initialRetryDelayMs: 1000 // 1s exponential backoff initial delay
};
