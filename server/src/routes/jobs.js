import { Router } from 'express';
import { getDatabase } from '../db/database.js';

const router = Router();

/**
 * GET /api/jobs
 * Query Parameters:
 *  - page (default 1)
 *  - limit (default 20)
 *  - search (text match on title, company, description)
 *  - location (text filter on location)
 *  - category (filter on category)
 *  - jobType (filter on job_type)
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const search = (req.query.search || '').trim();
    const location = (req.query.location || '').trim();
    const category = (req.query.category || '').trim();
    const jobType = (req.query.jobType || '').trim();

    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (location) {
      whereClauses.push('location LIKE ?');
      params.push(`%${location}%`);
    }

    if (category) {
      whereClauses.push('category = ?');
      params.push(category);
    }

    if (jobType) {
      whereClauses.push('job_type = ?');
      params.push(jobType);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total matching jobs
    const countQuery = `SELECT COUNT(*) AS count FROM jobs ${whereSql}`;
    const totalItems = db.prepare(countQuery).get(...params).count;

    // Retrieve paginated jobs sorted by published_at DESC
    const selectQuery = `
      SELECT 
        id, source, external_id AS externalId, title, company, location,
        job_type AS jobType, category, description, url, published_at AS publishedAt,
        fetched_at AS fetchedAt, created_at AS createdAt, updated_at AS updatedAt
      FROM jobs 
      ${whereSql}
      ORDER BY datetime(published_at) DESC, id DESC
      LIMIT ? OFFSET ?
    `;

    const jobs = db.prepare(selectQuery).all(...params, limit, offset);

    // Get unique categories and jobTypes for frontend filter dropdowns
    const categories = db.prepare(`SELECT DISTINCT category FROM jobs WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`).all().map(r => r.category);
    const jobTypes = db.prepare(`SELECT DISTINCT job_type FROM jobs WHERE job_type IS NOT NULL AND job_type != '' ORDER BY job_type ASC`).all().map(r => r.job_type);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages
        },
        filters: {
          categories,
          jobTypes
        }
      }
    });
  } catch (error) {
    console.error('[GET /api/jobs] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job listings from database'
    });
  }
});

export default router;
