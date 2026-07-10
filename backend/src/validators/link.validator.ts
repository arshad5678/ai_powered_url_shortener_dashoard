import { z } from 'zod';

import { ValidationSchemas } from '../types/validation.js';

// Core reusable validation rules
const titleRule = z
  .string({ required_error: 'Title is required' })
  .min(1, 'Title cannot be empty')
  .max(120, 'Title cannot exceed 120 characters');

const originalUrlRule = z
  .string({ required_error: 'Original URL is required' })
  .url('Must be a valid URL')
  .refine((val) => val.startsWith('http://') || val.startsWith('https://'), {
    message: 'Original URL must start with http:// or https://',
  });

const shortCodeRule = z
  .string()
  .min(3, 'Short code must be at least 3 characters long')
  .max(20, 'Short code cannot exceed 20 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Short code can only contain letters, numbers, hyphens, and underscores'
  );

const customAliasRule = shortCodeRule;

const expiresAtRule = z.coerce.date().refine((date) => date > new Date(), {
  message: 'Expiry date must be in the future',
});

/**
 * Request body schema for Link Creation
 */
export const CreateLinkSchema: ValidationSchemas = {
  body: z.object({
    title: titleRule,
    originalUrl: originalUrlRule,
    shortCode: shortCodeRule.optional(),
    customAlias: customAliasRule.optional(),
    expiresAt: expiresAtRule.optional(),
  }),
};

/**
 * Request body schema for Link Updates (all optional)
 */
export const UpdateLinkSchema: ValidationSchemas = {
  body: z.object({
    title: titleRule.optional(),
    originalUrl: originalUrlRule.optional(),
    shortCode: shortCodeRule.optional(),
    customAlias: customAliasRule.optional(),
    expiresAt: expiresAtRule.optional(),
  }),
};

/**
 * Query schema for Listing Links (includes pagination & sorting)
 */
export const ListLinksQuerySchema: ValidationSchemas = {
  query: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'title', 'originalUrl', 'shortCode']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

/**
 * URL Parameter schema for Toggling Link Status
 */
export const ToggleStatusSchema: ValidationSchemas = {
  params: z.object({
    id: z.string().uuid('Invalid link ID format (must be a valid UUID)'),
  }),
};

/**
 * URL Parameter schema for Deleting a Link
 */
export const DeleteLinkSchema: ValidationSchemas = {
  params: z.object({
    id: z.string().uuid('Invalid link ID format (must be a valid UUID)'),
  }),
};
