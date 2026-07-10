import { Request, Response } from 'express';

import { redis } from '../database/redis.js';
import { logger } from '../logger/index.js';
import { ClickService } from '../services/click.service.js';
import { LinkService } from '../services/link.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const linkService = new LinkService();
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
 * Fires analytics click recording in the background without blocking the request pipeline.
 */
const triggerAnalytics = (req: Request, linkId: string): void => {
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

  clickService
    .recordClick(linkId, {
      browser,
      operatingSystem,
      country,
      referrer,
      ipAddress,
    })
    .catch((err) => {
      logger.error(`[RedirectEngine] Asynchronous analytics tracking failed: ${err.message}`, {
        err,
      });
    });
};

/**
 * Validates, caches, and executes short URL client redirections.
 */
export const handleRedirect = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { shortCode } = req.params;
  const cacheKey = `redirect:${shortCode}`;

  // 1. Check Redis Cache
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    logger.info(`[RedirectEngine] Cache HIT for shortCode: ${shortCode}`);
    const { id, originalUrl } = JSON.parse(cachedData);

    // Record Analytics Asynchronously (do NOT await!)
    triggerAnalytics(req, id);

    // Redirect immediately (302 Found)
    return res.redirect(302, originalUrl);
  }

  logger.info(`[RedirectEngine] Cache MISS for shortCode: ${shortCode}`);

  // 2. Query Database (via LinkService) & Enforce active validations
  const { id, originalUrl } = await linkService.getRedirectUrl(shortCode);

  // 3. Store in Redis with TTL = 1 hour (3600 seconds)
  await redis.set(cacheKey, JSON.stringify({ id, originalUrl }), {
    EX: 3600,
  });

  // 4. Record Analytics Asynchronously (do NOT await!)
  triggerAnalytics(req, id);

  // 5. Redirect (302 Found)
  return res.redirect(302, originalUrl);
});
