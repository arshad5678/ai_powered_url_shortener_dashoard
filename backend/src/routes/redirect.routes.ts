import { Router } from 'express';
import { z } from 'zod';

import { handleRedirect } from '../controllers/redirect.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schema for routing slug parameters
const RedirectParamsSchema = {
  params: z.object({
    shortCode: z
      .string({ required_error: 'shortCode is required' })
      .min(3, 'Invalid shortCode length')
      .max(20, 'Invalid shortCode length')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid shortCode format'),
  }),
};

// GET /r/:shortCode
router.get('/:shortCode', validate(RedirectParamsSchema), handleRedirect);

export default router;
