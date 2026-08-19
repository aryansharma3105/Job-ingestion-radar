/**
 * Base Source Adapter Interface
 * All job source adapters (e.g. Remotive, RSS feeds, GitHub Jobs) extend or implement this contract.
 * This guarantees that source-specific parsing logic is isolated from the ingestion pipeline.
 */
export class BaseJobSource {
  constructor(sourceName, url) {
    this.sourceName = sourceName;
    this.url = url;
  }

  /**
   * Parse raw payload into raw array of job items
   * @param {any} payload Raw JSON or RSS data
   * @returns {Array<any>} List of raw job objects
   */
  parseRawJobs(payload) {
    throw new Error('parseRawJobs must be implemented by subclass');
  }

  /**
   * Extract unique external ID from raw job object
   * @param {any} rawJob 
   * @returns {string|null}
   */
  extractExternalId(rawJob) {
    throw new Error('extractExternalId must be implemented by subclass');
  }

  /**
   * Normalize raw job object into standard normalized Job schema
   * @param {any} rawJob 
   * @returns {object} Normalized job object
   */
  normalize(rawJob) {
    throw new Error('normalize must be implemented by subclass');
  }
}
