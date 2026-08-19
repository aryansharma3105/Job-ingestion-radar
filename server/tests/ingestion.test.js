import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { IngestionService } from '../src/ingestion/ingestionService.js';
import { RemotiveJobSource } from '../src/ingestion/sources/remotiveSource.js';
import { getDatabase, closeDatabase } from '../src/db/database.js';

const TEST_DB_PATH = path.resolve(__dirname, './test_ingestion.db');

describe('Ingestion Service Pipeline & Deduplication', () => {
  beforeEach(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    // Initialize test DB
    getDatabase(TEST_DB_PATH);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    vi.restoreAllMocks();
  });

  it('1. Successfully ingests raw jobs into database', async () => {
    const mockPayload = {
      jobs: [
        {
          id: 101,
          title: 'Senior React Developer',
          company_name: 'Tech Corp',
          candidate_required_location: 'Worldwide',
          job_type: 'full_time',
          category: 'Software Development',
          description: '<p>Build UI components</p>',
          url: 'https://remotive.com/remote-jobs/101',
          publication_date: '2026-08-18T10:00:00Z'
        },
        {
          id: 102,
          title: 'Node.js Backend Engineer',
          company_name: 'Data Systems',
          candidate_required_location: 'USA',
          job_type: 'contract',
          category: 'Software Development',
          description: '<p>Build Express APIs</p>',
          url: 'https://remotive.com/remote-jobs/102',
          publication_date: '2026-08-18T11:00:00Z'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPayload
    });

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    const result = await service.runIngestion();

    expect(result.status).toBe('SUCCESS');
    expect(result.jobsFetched).toBe(2);
    expect(result.jobsInserted).toBe(2);
    expect(result.jobsUpdated).toBe(0);
    expect(result.duplicatesSkipped).toBe(0);

    const db = getDatabase(TEST_DB_PATH);
    const jobs = db.prepare('SELECT * FROM jobs').all();
    expect(jobs.length).toBe(2);
    expect(jobs[0].title).toBe('Senior React Developer');
  });

  it('2. Correctly counts DUPLICATE_SKIPPED on consecutive identical ingestion', async () => {
    const mockPayload = {
      jobs: [
        {
          id: 101,
          title: 'Senior React Developer',
          company_name: 'Tech Corp',
          candidate_required_location: 'Worldwide',
          job_type: 'full_time',
          category: 'Software Development',
          description: '<p>Build UI components</p>',
          url: 'https://remotive.com/remote-jobs/101',
          publication_date: '2026-08-18T10:00:00Z'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPayload
    });

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    
    // First run - inserts 1
    const run1 = await service.runIngestion();
    expect(run1.jobsInserted).toBe(1);

    // Second run - identical payload -> duplicate skipped = 1, inserted = 0, updated = 0
    const run2 = await service.runIngestion();
    expect(run2.jobsInserted).toBe(0);
    expect(run2.jobsUpdated).toBe(0);
    expect(run2.duplicatesSkipped).toBe(1);
  });

  it('3. Correctly counts UPDATED when an existing job has updated fields', async () => {
    const initialPayload = {
      jobs: [
        {
          id: 101,
          title: 'Junior React Developer',
          company_name: 'Tech Corp',
          candidate_required_location: 'Worldwide',
          url: 'https://remotive.com/remote-jobs/101'
        }
      ]
    };

    const updatedPayload = {
      jobs: [
        {
          id: 101,
          title: 'Senior React Developer', // Title updated
          company_name: 'Tech Corp',
          candidate_required_location: 'Worldwide',
          url: 'https://remotive.com/remote-jobs/101'
        }
      ]
    };

    const fetchSpy = vi.spyOn(global, 'fetch');

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => initialPayload
    });

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    await service.runIngestion();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => updatedPayload
    });

    const run2 = await service.runIngestion();
    expect(run2.jobsInserted).toBe(0);
    expect(run2.jobsUpdated).toBe(1);
    expect(run2.duplicatesSkipped).toBe(0);

    const db = getDatabase(TEST_DB_PATH);
    const updatedJob = db.prepare("SELECT * FROM jobs WHERE external_id = '101'").get();
    expect(updatedJob.title).toBe('Senior React Developer');
  });

  it('4. Skips malformed records and increments invalid_records count', async () => {
    const mockPayload = {
      jobs: [
        {
          // missing id, title, url
          company_name: 'Broken Data Inc'
        },
        {
          id: 202,
          title: 'Valid Fullstack Engineer',
          company_name: 'Good Corp',
          url: 'https://remotive.com/remote-jobs/202'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPayload
    });

    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));
    const result = await service.runIngestion();

    expect(result.status).toBe('PARTIAL_SUCCESS');
    expect(result.jobsFetched).toBe(2);
    expect(result.jobsInserted).toBe(1);
    expect(result.invalidRecords).toBe(1);
  });

  it('5. Handles SUSPICIOUS_EMPTY response and preserves existing DB jobs', async () => {
    const service = new IngestionService(new RemotiveJobSource('https://mock.api/jobs'));

    // Populate initial job
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        jobs: [{ id: 301, title: 'DevOps Lead', company_name: 'Cloud LLC', url: 'https://remotive.com/301' }]
      })
    });
    await service.runIngestion();

    // Now return 0 jobs unexpectedly
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: [] })
    });

    const result = await service.runIngestion();

    expect(result.status).toBe('SUSPICIOUS_EMPTY');
    expect(result.jobsFetched).toBe(0);

    // Verify existing database data was preserved
    const db = getDatabase(TEST_DB_PATH);
    const count = db.prepare('SELECT COUNT(*) AS count FROM jobs').get().count;
    expect(count).toBe(1);
  });
});
