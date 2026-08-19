import { z } from 'zod';

/**
 * Zod Schema for normalized job validation
 */
export const NormalizedJobSchema = z.object({
  source: z.string().min(1),
  externalId: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().nullable().optional(),
  jobType: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  publishedAt: z.string().nullable().optional()
});

/**
 * Validates and sanitizes a normalized job object.
 * Returns { valid: true, data: normalizedObject } or { valid: false, error: string }
 */
export function validateNormalizedJob(jobData) {
  const result = NormalizedJobSchema.safeParse(jobData);
  if (!result.success) {
    const errorDetails = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return { valid: false, error: errorDetails };
  }
  return { valid: true, data: result.data };
}
