import { PrismaClient } from '@prisma/client';

import { env } from '../config/env.js';
import { logger } from '../logger/index.js';

// Instantiate PrismaClient singleton using the validated environment variables
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

/**
 * Helper to delay execution.
 * @param ms - Milliseconds to delay
 */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Establishes connection to PostgreSQL using Prisma Client.
 * Implements connection caching (prevents duplicate connections/concurrent calls)
 * and attempts up to 3 retries (4 total attempts) with a 2-second delay on failure.
 */
export function connectDatabase(): Promise<void> {
  if (isConnected) {
    logger.info('Database connection already established.');
    return Promise.resolve();
  }

  if (connectionPromise) {
    logger.info('Database connection attempt already in progress.');
    return connectionPromise;
  }

  const maxRetries = 3;
  const retryDelayMs = 2000;

  connectionPromise = (async (): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (attempt > 1) {
          logger.info(`Database connection attempt ${attempt}/${maxRetries + 1}...`);
        } else {
          logger.info('Connecting to the database...');
        }

        // Trigger connection
        await prisma.$connect();
        
        // Execute a simple verification query to ensure database is responsive
        await prisma.$executeRawUnsafe('SELECT 1');

        isConnected = true;
        logger.info('Successfully connected to the database.');
        connectionPromise = null;
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Database connection attempt ${attempt} failed: ${errorMessage}`);

        if (attempt <= maxRetries) {
          logger.info(`Waiting ${retryDelayMs / 1000} seconds before retrying connection...`);
          await delay(retryDelayMs);
        } else {
          connectionPromise = null;
          logger.error('All database connection attempts failed.');
          throw new Error(`Failed to connect to the database after ${maxRetries} retries: ${errorMessage}`);
        }
      }
    }
  })();

  return connectionPromise;
}

/**
 * Gracefully disconnects from PostgreSQL.
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    logger.info('Database is already disconnected.');
    return;
  }

  try {
    logger.info('Disconnecting from database...');
    await prisma.$disconnect();
    isConnected = false;
    logger.info('Successfully disconnected from the database.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error while disconnecting from the database: ${errorMessage}`);
    throw error;
  }
}
