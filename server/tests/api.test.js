import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app.js';
import { getDatabase, closeDatabase } from '../src/db/database.js';

const TEST_DB_PATH = path.resolve(__dirname, './test_api.db');

describe('Express REST API Endpoints', () => {
  let app;

  beforeEach(() => {
    process.env.DATABASE_PATH = TEST_DB_PATH;
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const db = getDatabase(TEST_DB_PATH);

    // Seed database with sample test jobs
    const stmt = db.prepare(
      `INSERT INTO jobs (source, external_id, title, company, location, job_type, category, description, url, published_at, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const now = new Date().toISOString();
    stmt.run('remotive', '1', 'Frontend Developer', 'Acme Inc', 'USA', 'full_time', 'Software Development', 'React job', 'https://remotive.com/1', now, now);
    stmt.run('remotive', '2', 'Backend Developer', 'Acme Inc', 'Worldwide', 'contract', 'Software Development', 'Node.js job', 'https://remotive.com/2', now, now);
    stmt.run('remotive', '3', 'Marketing Specialist', 'Growth Co', 'Europe', 'full_time', 'Marketing', 'SEO job', 'https://remotive.com/3', now, now);

    app = createApp();
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    vi.restoreAllMocks();
  });

  it('GET /api/health - returns healthy status and database metrics', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.metrics.totalJobsStored).toBe(3);
  });

  it('GET /api/jobs - returns paginated jobs and filter options', async () => {
    const res = await request(app).get('/api/jobs?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jobs.length).toBe(2);
    expect(res.body.data.pagination.totalItems).toBe(3);
    expect(res.body.data.pagination.totalPages).toBe(2);
    expect(res.body.data.filters.categories).toContain('Software Development');
  });

  it('GET /api/jobs - filters jobs by search keyword', async () => {
    const res = await request(app).get('/api/jobs?search=Marketing');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.length).toBe(1);
    expect(res.body.data.jobs[0].title).toBe('Marketing Specialist');
  });

  it('GET /api/jobs - filters jobs by category', async () => {
    const res = await request(app).get('/api/jobs?category=Software Development');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.length).toBe(2);
  });

  it('POST /api/ingest - triggers manual ingestion run', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        jobs: [{ id: 99, title: 'New Engineer', company_name: 'New Corp', url: 'https://remotive.com/99' }]
      })
    });

    const res = await request(app).post('/api/ingest');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUCCESS');
    expect(res.body.data.jobsInserted).toBe(1);
  });

  it('GET /api/ingest/status - returns source health and run history', async () => {
    const res = await request(app).get('/api/ingest/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sourceHealth.state).toBe('OPERATIONAL');
    expect(res.body.data.totalStoredJobs).toBe(3);
  });
});
