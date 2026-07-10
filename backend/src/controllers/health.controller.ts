import { Request, Response } from 'express';

import { env } from '../config/env.js';
import { prisma } from '../database/database.js';
import { logger } from '../logger/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Executes a simple query to verify database connection viability.
 * @returns boolean indicating database health status
 */
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$executeRawUnsafe('SELECT 1');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[HealthController] Database ping failed: ${errorMessage}`);
    return false;
  }
};

/**
 * Detailed Health Check endpoint
 * GET /health
 */
export const healthCheck = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const isDbUp = await checkDatabaseHealth();

  const data = {
    status: isDbUp ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: isDbUp ? 'up' : 'down',
  };

  const statusCode = isDbUp ? 200 : 503;

  res.status(statusCode).json({
    success: isDbUp,
    data,
  });
});

/**
 * Readiness Probe endpoint
 * GET /ready
 */
export const readinessCheck = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const isDbUp = await checkDatabaseHealth();

  const data = {
    ready: isDbUp,
    database: isDbUp ? 'up' : 'down',
  };

  const statusCode = isDbUp ? 200 : 503;

  res.status(statusCode).json({
    success: isDbUp,
    data,
  });
});

/**
 * Liveness Probe endpoint
 * GET /live
 */
export const livenessCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'alive',
  });
};

