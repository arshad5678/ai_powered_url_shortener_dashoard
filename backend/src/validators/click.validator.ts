import { z } from 'zod';

import { ValidationSchemas } from '../types/validation.js';

/**
 * Request parameter and query validation schema for link click analytics.
 */
export const GetAnalyticsQuerySchema: ValidationSchemas = {
  params: z.object({
    id: z.string().uuid('Invalid link ID format (must be a valid UUID)'),
  }),
  query: z.object({
    rangeDays: z.coerce
      .number()
      .int()
      .min(1, 'Date range must be at least 1 day')
      .optional()
      .default(7),
    browser: z.string().optional(),
    country: z.string().optional(),
    referrer: z.string().optional(),
  }),
};
