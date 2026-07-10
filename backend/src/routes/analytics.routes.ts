import { Router } from 'express';
import { z } from 'zod';

import {
  getDashboardAnalytics,
  getLinkAnalytics,
  getLinkBrowsers,
  getLinkCountries,
  getLinkOS,
  getLinkReferrers,
  getLinkTimeline,
} from '../controllers/analytics.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schema for parsing and coercing query range days and path parameters
const AnalyticsQuerySchema = {
  params: z.object({
    linkId: z.string().uuid('Invalid link ID format (must be a valid UUID)'),
  }),
  query: z.object({
    rangeDays: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 7))
      .refine((val) => [7, 30, 90].includes(val), {
        message: 'Range days must be either 7, 30, or 90.',
      }),
  }),
};

// GET /api/analytics/dashboard - System dashboard overview metrics
// Note: Placed first to prevent collision with dynamic linkId param route
router.get('/dashboard', getDashboardAnalytics);

// GET /api/analytics/:linkId - Full analytics payload for a specific link
router.get('/:linkId', validate(AnalyticsQuerySchema), getLinkAnalytics);

// GET /api/analytics/:linkId/browsers - Browser popularity breakdown
router.get('/:linkId/browsers', validate(AnalyticsQuerySchema), getLinkBrowsers);

// GET /api/analytics/:linkId/os - Operating system popularity breakdown
router.get('/:linkId/os', validate(AnalyticsQuerySchema), getLinkOS);

// GET /api/analytics/:linkId/countries - Country popularity breakdown
router.get('/:linkId/countries', validate(AnalyticsQuerySchema), getLinkCountries);

// GET /api/analytics/:linkId/referrers - Referrer popularity breakdown
router.get('/:linkId/referrers', validate(AnalyticsQuerySchema), getLinkReferrers);

// GET /api/analytics/:linkId/timeline - Day-by-day click aggregates timeline
router.get('/:linkId/timeline', validate(AnalyticsQuerySchema), getLinkTimeline);

export default router;
