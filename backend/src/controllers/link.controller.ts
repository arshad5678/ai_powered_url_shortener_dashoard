import { Request, Response } from 'express';

import { HttpStatus } from '../constants/httpStatus.js';
import { AiService } from '../services/ai.service.js';
import { LinkService } from '../services/link.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const linkService = new LinkService();
const aiService = new AiService();

/**
 * Creates a new shortened Link.
 */
export const createLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await linkService.createLink(req.body);
  res.status(HttpStatus.CREATED).json({
    success: true,
    message: 'Short link created successfully.',
    data,
  });
});

/**
 * Lists all active links with pagination, filtering, and sorting support.
 */
export const getAllLinks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await linkService.getAllLinks(req.query);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Links retrieved successfully.',
    data,
  });
});

/**
 * Retrieves a specific Link details by ID.
 */
export const getLinkById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await linkService.getLinkById(id);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Link details retrieved successfully.',
    data,
  });
});

/**
 * Retrieves Link details by its short code.
 */
export const getLinkByShortCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { shortCode } = req.params;
  const data = await linkService.getLinkByShortCode(shortCode);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Link details retrieved successfully.',
    data,
  });
});

/**
 * Updates an existing Link metadata.
 */
export const updateLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await linkService.updateLink(id, req.body);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Link updated successfully.',
    data,
  });
});

/**
 * Toggles a Link's active status (enable/disable).
 */
export const toggleLinkStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await linkService.toggleLinkStatus(id);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Link status toggled successfully.',
    data,
  });
});

/**
 * Performs a soft-delete of a Link.
 */
export const deleteLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await linkService.deleteLink(id);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Link deleted successfully.',
    data,
  });
});

/**
 * Checks availability of a custom alias.
 */
export const checkAliasAvailability = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const customAlias = (req.params.customAlias || req.query.customAlias) as string;
    const available = await linkService.checkAliasAvailability(customAlias);
    res.status(HttpStatus.OK).json({
      success: true,
      message: available ? 'Custom alias is available.' : 'Custom alias is already taken.',
      data: { available },
    });
  }
);

/**
 * Suggests 3 URL-safe aliases using the Gemini API or local fallbacks.
 */
export const suggestAliases = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, originalUrl } = req.body;
  const suggestions = await aiService.suggestAliases(title, originalUrl);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'AI alias suggestions generated successfully.',
    data: { suggestions },
  });
});

