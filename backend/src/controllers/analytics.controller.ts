import { Request, Response } from 'express';

import { HttpStatus } from '../constants/httpStatus.js';
import { ClickService } from '../services/click.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const clickService = new ClickService();

/**
 * Helper to extract rangeDays parameter from request query constraints.
 */
const getRangeDays = (req: Request): number => {
  return req.query.rangeDays ? parseInt(req.query.rangeDays as string, 10) : 7;
};

/**
 * Retrieves overall system status indicators and metrics.
 */
export const getDashboardAnalytics = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const data = await clickService.getDashboardAnalytics();
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully.',
      data,
    });
  }
);

/**
 * Retrieves consolidated analytics properties for a given link ID.
 */
export const getLinkAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { linkId } = req.params;
  const rangeDays = getRangeDays(req);
  const data = await clickService.getLinkAnalytics(linkId, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Link analytics details retrieved successfully.',
    data,
  });
});

/**
 * Retrieves top browsers breakdown metrics for a link ID.
 */
export const getLinkBrowsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { linkId } = req.params;
  const rangeDays = getRangeDays(req);
  const data = await clickService.getTopBrowsers(linkId, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top browsers analytics retrieved successfully.',
    data,
  });
});

/**
 * Retrieves top operating systems breakdown metrics for a link ID.
 */
export const getLinkOS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { linkId } = req.params;
  const rangeDays = getRangeDays(req);
  const data = await clickService.getTopOperatingSystems(linkId, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top operating systems analytics retrieved successfully.',
    data,
  });
});

/**
 * Retrieves top countries breakdown metrics for a link ID.
 */
export const getLinkCountries = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { linkId } = req.params;
  const rangeDays = getRangeDays(req);
  const data = await clickService.getTopCountries(linkId, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top countries analytics retrieved successfully.',
    data,
  });
});

/**
 * Retrieves top referrers breakdown metrics for a link ID.
 */
export const getLinkReferrers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { linkId } = req.params;
  const rangeDays = getRangeDays(req);
  const data = await clickService.getTopReferrers(linkId, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top referrers analytics retrieved successfully.',
    data,
  });
});

/**
 * Retrieves daily timeline metrics for a link ID.
 */
export const getLinkTimeline = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { linkId } = req.params;
  const rangeDays = getRangeDays(req);
  const data = await clickService.getDailyClicks(linkId, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Daily timeline clicks retrieved successfully.',
    data,
  });
});
