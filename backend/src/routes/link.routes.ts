import { Router } from 'express';
import { z } from 'zod';

import {
  checkAliasAvailability,
  createLink,
  deleteLink,
  getAllLinks,
  getLinkById,
  suggestAliases,
  toggleLinkStatus,
  updateLink,
} from '../controllers/link.controller.js';
import { validate } from '../middleware/validate.js';
import {
  CreateLinkSchema,
  DeleteLinkSchema,
  ListLinksQuerySchema,
  ToggleStatusSchema,
  UpdateLinkSchema,
} from '../validators/link.validator.js';

const router = Router();

// Reusable parameter schema for UUID validation
const GetLinkParamsSchema = {
  params: z.object({
    id: z.string().uuid('Invalid link ID format (must be a valid UUID)'),
  }),
};

// Reusable query schema for checking custom alias availability
const CheckAliasQuerySchema = {
  query: z.object({
    customAlias: z
      .string({ required_error: 'customAlias is required' })
      .min(1, 'customAlias cannot be empty'),
  }),
};

// Combined update request schema (validation for path parameters and request body)
const UpdateLinkRequestSchema = {
  params: GetLinkParamsSchema.params,
  body: UpdateLinkSchema.body,
};

// Validation schema for suggestion requests (body must carry title and valid originalUrl)
const SuggestAliasesSchema = {
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(120, 'Title cannot exceed 120 characters'),
    originalUrl: z
      .string({ required_error: 'Original URL is required' })
      .url('Invalid URL format')
      .regex(/^https?:\/\//, 'URL must start with http:// or https://'),
  }),
};

// --- REST Routing Definitions ---

// POST /api/links - Create Short Link
router.post('/', validate(CreateLinkSchema), createLink);

// GET /api/links - Retrieve paginated list of active links
router.get('/', validate(ListLinksQuerySchema), getAllLinks);

// POST /api/links/suggest-aliases - Generate AI alias suggestions
// Note: Registered before GET /api/links/:id to prevent URL route collisions
router.post('/suggest-aliases', validate(SuggestAliasesSchema), suggestAliases);

// GET /api/links/check-alias - Verify if a custom alias is currently available
// Note: Registered before GET /api/links/:id to prevent URL route collisions
router.get('/check-alias', validate(CheckAliasQuerySchema), checkAliasAvailability);

// GET /api/links/:id - Get Link Details by ID
router.get('/:id', validate(GetLinkParamsSchema), getLinkById);

// PUT /api/links/:id - Update Link metadata
router.put('/:id', validate(UpdateLinkRequestSchema), updateLink);

// PATCH /api/links/:id/status - Toggle active/inactive status of a link
router.patch('/:id/status', validate(ToggleStatusSchema), toggleLinkStatus);

// DELETE /api/links/:id - Soft-delete a link (flags deletedAt)
router.delete('/:id', validate(DeleteLinkSchema), deleteLink);

export default router;
