import { BaseJobSource } from './baseSource.js';

/**
 * Remotive Job Source Adapter
 * Handles parsing Remotive API response structure (https://remotive.com/api/remote-jobs).
 */
export class RemotiveJobSource extends BaseJobSource {
  constructor(url) {
    super('remotive', url);
  }

  parseRawJobs(payload) {
    if (!payload || typeof payload !== 'object') {
      return [];
    }
    if (Array.isArray(payload.jobs)) {
      return payload.jobs;
    }
    return [];
  }

  extractExternalId(rawJob) {
    if (!rawJob) return null;
    if (rawJob.id !== undefined && rawJob.id !== null) {
      return String(rawJob.id);
    }
    return null;
  }

  normalize(rawJob) {
    const externalId = this.extractExternalId(rawJob);
    if (!externalId) {
      throw new Error('Missing external_id in raw job record');
    }

    const title = (rawJob.title || '').trim();
    if (!title) {
      throw new Error('Missing job title in raw job record');
    }

    const company = (rawJob.company_name || '').trim();
    if (!company) {
      throw new Error('Missing company_name in raw job record');
    }

    const url = (rawJob.url || '').trim();
    if (!url) {
      throw new Error('Missing job URL in raw job record');
    }

    // Safe publication date parsing
    let publishedAt = null;
    if (rawJob.publication_date) {
      const parsedDate = new Date(rawJob.publication_date);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate.toISOString();
      }
    }

    return {
      source: this.sourceName,
      externalId,
      title,
      company,
      location: (rawJob.candidate_required_location || 'Remote').trim() || null,
      jobType: (rawJob.job_type || null)?.trim() || null,
      category: (rawJob.category || null)?.trim() || null,
      description: rawJob.description || null,
      url,
      publishedAt
    };
  }
}
