import { Request } from 'express';
import morgan from 'morgan';

import { logger } from '../logger/index.js';

const format = ':method :url :status :response-time ms - :remote-addr';

const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

const skip = (req: Request): boolean => {
  const url = req.originalUrl || req.url;
  return url === '/health' || url === '/api/health';
};

/**
 * Reusable Express request audit logger leveraging Morgan.
 * Dispatches outputs via the centralized Winston logger instance.
 */
export const requestLogger = morgan(format, { stream, skip });
