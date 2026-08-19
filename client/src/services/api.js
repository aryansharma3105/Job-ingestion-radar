const API_BASE = '/api';

export async function fetchJobs(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.search) query.append('search', params.search);
  if (params.location) query.append('location', params.location);
  if (params.category) query.append('category', params.category);
  if (params.jobType) query.append('jobType', params.jobType);

  const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch jobs`);
  }
  return res.json();
}

export async function triggerIngestion() {
  const res = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Ingestion failed`);
  }
  return res.json();
}

export async function fetchIngestionStatus() {
  const res = await fetch(`${API_BASE}/ingest/status`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch status`);
  }
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch health`);
  }
  return res.json();
}
