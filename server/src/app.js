import express from 'express';
import cors from 'cors';
import jobsRouter from './routes/jobs.js';
import ingestRouter from './routes/ingest.js';
import healthRouter from './routes/health.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount API routes
  app.use('/api/jobs', jobsRouter);
  app.use('/api/ingest', ingestRouter);
  app.use('/api/health', healthRouter);

  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  return app;
}
