import { Request, Response } from 'express';

import { HttpStatus } from '../constants/httpStatus.js';
import { ClickService } from '../services/click.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const clickService = new ClickService();

/**
 * Reusable private helper to extract browser type from User-Agent string.
 */
const parseBrowser = (ua: string): string => {
  if (!ua) return 'Unknown';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edge')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
};

/**
 * Reusable private helper to extract Operating System from User-Agent string.
 */
const parseOS = (ua: string): string => {
  if (!ua) return 'Unknown';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Macintosh')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
};

/**
 * Logs a redirection click event.
 */
export const recordClick = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ipAddress =
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined;
  const referrer = (req.headers['referer'] ||
    req.headers['referrer'] ||
    undefined) as string | undefined;
  const userAgent = req.headers['user-agent'] || '';
  const country = (req.headers['cf-ipcountry'] ||
    req.headers['x-country-code'] ||
    undefined) as string | undefined;

  const browser = parseBrowser(userAgent);
  const operatingSystem = parseOS(userAgent);

  const success = await clickService.recordClick(id, {
    browser,
    operatingSystem,
    country,
    referrer,
    ipAddress,
  });

  res.status(HttpStatus.OK).json({
    success,
    message: success
      ? 'Click event recorded successfully.'
      : 'Click event ignored (link expired, inactive, or not found).',
    data: {},
  });
});

/**
 * Retrieves comprehensive analytics telemetry for a specific link.
 */
export const getLinkAnalytics = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await clickService.getLinkAnalytics(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Link analytics retrieved successfully.',
      data,
    });
  }
);

/**
 * Retrieves overall system metrics for the dashboard home view.
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
 * Retrieves daily click counts inside a range to construct charts.
 */
export const getDailyClicks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const rangeDays = req.query.rangeDays ? parseInt(req.query.rangeDays as string, 10) : undefined;
  const data = await clickService.getDailyClicks(id, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Daily click timeline retrieved successfully.',
    data,
  });
});

/**
 * Retrieves browser popularity counts.
 */
export const getTopBrowsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const rangeDays = req.query.rangeDays ? parseInt(req.query.rangeDays as string, 10) : undefined;
  const data = await clickService.getTopBrowsers(id, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top browsers retrieved successfully.',
    data,
  });
});

/**
 * Retrieves operating system popularity counts.
 */
export const getTopOperatingSystems = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const rangeDays = req.query.rangeDays ? parseInt(req.query.rangeDays as string, 10) : undefined;
    const data = await clickService.getTopOperatingSystems(id, rangeDays);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Top operating systems retrieved successfully.',
      data,
    });
  }
);

/**
 * Retrieves country popularity counts.
 */
export const getTopCountries = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const rangeDays = req.query.rangeDays ? parseInt(req.query.rangeDays as string, 10) : undefined;
  const data = await clickService.getTopCountries(id, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top countries retrieved successfully.',
    data,
  });
});

/**
 * Groups and retrieves top referrers.
 */
export const getTopReferrers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const rangeDays = req.query.rangeDays ? parseInt(req.query.rangeDays as string, 10) : undefined;
  const data = await clickService.getTopReferrers(id, rangeDays);
  res.status(HttpStatus.OK).json({
    success: true,
    message: 'Top referrers retrieved successfully.',
    data,
  });
});
