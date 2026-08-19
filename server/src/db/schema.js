export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  category TEXT,
  description TEXT,
  url TEXT NOT NULL,
  published_at TEXT,
  fetched_at TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, external_id)
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  duration_ms INTEGER,
  status TEXT NOT NULL,
  jobs_fetched INTEGER DEFAULT 0,
  jobs_inserted INTEGER DEFAULT 0,
  jobs_updated INTEGER DEFAULT 0,
  duplicates_skipped INTEGER DEFAULT 0,
  invalid_records INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
`;
