import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { IngestionService } from '../src/ingestion/ingestionService.js';
import { RemotiveJobSource } from '../src/ingestion/sources/remotiveSource.js';
import { getDatabase, closeDatabase } from '../src/db/database.js';

const TEST_DB_PATH = path.resolve(__dirname, './test_resilience.db');

describe('Ingestion Resilience, Retry & Error Handling', () => {
  beforeEach(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    getDatabase(TEST_DB_PATH);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    vi.restoreAllMocks();
  });

  it('1. Retries HTTP 429 Rate Limit error up to max 3 attempts', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    // Fail 2 times with 429, then succeed on 3rd attempt
    fetchSpy
      .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests', headers: new Map() })
      .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests', headers: new Map() })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobs: [{ id: 501, title: 'Security Architect', company_name: 'CyberSec', url: 'https://remotive.com/501' }]
        })
      });

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    const result = await service.runIngestion();

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result.status).toBe('SUCCESS');
    expect(result.retryCount).toBe(2);
    expect(result.jobsInserted).toBe(1);
  });

  it('2. Fails gracefully on persistent HTTP 500 error after 3 attempts', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error', headers: new Map() });

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    const result = await service.runIngestion();

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result.status).toBe('FAILED');
    expect(result.errorMessage).toContain('Transient HTTP Error 500');
  });

  it('3. Fails gracefully on network timeout / abort error', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    fetchSpy.mockRejectedValue(abortError);

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    const result = await service.runIngestion();

    expect(result.status).toBe('FAILED');
    expect(result.errorMessage).toContain('timeout');
  });

  it('4. Preserves previously stored data when external source fails', async () => {
    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));

    // Step 1: Successful initial seed
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        jobs: [{ id: 999, title: 'Legacy Job', company_name: 'Old Co', url: 'https://remotive.com/999' }]
      })
    });
    await service.runIngestion();

    // Step 2: External outage (HTTP 503)
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable', headers: new Map() });

    const failedRun = await service.runIngestion();
    expect(failedRun.status).toBe('FAILED');

    // Step 3: Verify database jobs remain intact
    const db = getDatabase(TEST_DB_PATH);
    const jobs = db.prepare('SELECT * FROM jobs').all();
    expect(jobs.length).toBe(1);
    expect(jobs[0].title).toBe('Legacy Job');
  });
});
