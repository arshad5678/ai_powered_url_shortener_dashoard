import winston from 'winston';

import { env } from '../config/env.js';

const logLevel = env.LOG_LEVEL || 'info';
const isDevelopment = env.NODE_ENV === 'development';

// Formatter for Local Development (colorized, human-readable console outputs)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    // Destructure with type assertion to Record<string, unknown> to satisfy strict type resolution
    const { timestamp, level, message, stack, ...metadata } = info as Record<string, unknown>;

    const metaString = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : '';
    const logStack = typeof stack === 'string' ? `\n${stack}` : '';

    return `[${timestamp}] ${level}: ${message}${metaString}${logStack}`;
  })
);

// Formatter for Production (structured cloud-friendly JSON logs with trace capabilities)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: logLevel,
  format: isDevelopment ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});

export { logger };
