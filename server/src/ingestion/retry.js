import { config } from '../config.js';

/**
 * Checks if an HTTP status code or error is transient and eligible for retry.
 */
export function isTransientError(statusOrError) {
  if (typeof statusOrError === 'number') {
    return [429, 500, 502, 503, 504].includes(statusOrError);
  }
  if (statusOrError && statusOrError.name === 'AbortError') {
    return true; // Timeout
  }
  if (statusOrError && statusOrError.code) {
    return ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'].includes(statusOrError.code);
  }
  return true; // Default network fetch error
}

/**
 * Executes fetch with AbortController timeout, status validation, and exponential backoff.
 * 
 * @param {string} url 
 * @param {object} options 
 * @returns {Promise<{ payload: any, responseTimeMs: number, retryCount: number }>}
 */
export async function fetchWithRetry(url, options = {}) {
  const maxAttempts = options.maxAttempts || config.maxRetryAttempts;
  let initialDelayMs = options.initialDelayMs || config.initialRetryDelayMs;
  const timeoutMs = options.timeoutMs || config.requestTimeoutMs;

  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AcdyonJobIngestionEngine/1.0 (+https://acdyon.com)',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timer);
      const responseTimeMs = Date.now() - startTime;

      if (response.ok) {
        const payload = await response.json();
        return {
          payload,
          responseTimeMs,
          retryCount: attempt - 1,
          status: response.status
        };
      }

      // HTTP Error
      const status = response.status;
      if (!isTransientError(status)) {
        // Permanent error (e.g. 404, 401, 403) - fail fast without retry
        throw new Error(`Permanent HTTP Error: ${status} ${response.statusText}`);
      }

      lastError = new Error(`Transient HTTP Error ${status}: ${response.statusText}`);

      // Handle 429 Retry-After header if present
      let delay = initialDelayMs * Math.pow(2, attempt - 1);
      const retryAfter = response.headers.get('retry-after');
      if (status === 429 && retryAfter) {
        const retryAfterSeconds = parseInt(retryAfter, 10);
        if (!isNaN(retryAfterSeconds)) {
          delay = retryAfterSeconds * 1000;
        }
      }

      if (attempt < maxAttempts) {
        console.warn(`[Ingestion Retry] Attempt ${attempt}/${maxAttempts} failed (${lastError.message}). Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    } catch (err) {
      clearTimeout(timer);
      const responseTimeMs = Date.now() - startTime;

      if (err.name === 'AbortError') {
        lastError = new Error(`Request timeout after ${timeoutMs}ms`);
      } else {
        lastError = err;
      }

      if (!isTransientError(err) && err.name !== 'AbortError') {
        throw lastError;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      if (attempt < maxAttempts) {
        console.warn(`[Ingestion Retry] Attempt ${attempt}/${maxAttempts} failed (${lastError.message}). Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch from ${url} after ${maxAttempts} attempts`);
}
