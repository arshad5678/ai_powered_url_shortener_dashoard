import http from 'http';

import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './database/database.js';
import { connectRedis, disconnectRedis } from './database/redis.js';
import { logger } from './logger/index.js';

const server = http.createServer(app);

/**
 * Promise wrapper to close the HTTP server.
 */
const closeHttpServer = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((err) => {
      if (err) {
        logger.error('[Server] Error closing HTTP server:', err);
      } else {
        logger.info('[Server] HTTP server closed successfully.');
      }
      resolve();
    });
  });
};

const handleShutdown = async (signal: string, exitCode: number): Promise<void> => {
  logger.info(`[Server] ${signal} received. Initiating graceful shutdown...`);

  // Force shutdown after 10 seconds if connections are hanging
  const forceExitTimeout = setTimeout(() => {
    logger.error('[Server] Graceful shutdown timeout exceeded. Force exiting.');
    process.exit(1);
  }, 10000);

  // Unref the timeout so it doesn't block the event loop if everything else exits
  forceExitTimeout.unref();

  try {
    // 1. Close HTTP server to stop accepting new requests
    await closeHttpServer();

    // 2. Disconnect from database gracefully
    await disconnectDatabase();

    // 3. Disconnect from Redis gracefully
    await disconnectRedis();

    clearTimeout(forceExitTimeout);
    process.exit(exitCode);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Server] Error during graceful shutdown: ${errorMessage}`);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
};

const bootstrap = async (): Promise<void> => {
  try {
    // Connect to PostgreSQL before starting the HTTP server
    await connectDatabase();

    // Connect to Redis before starting the HTTP server
    await connectRedis();

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(
          `[Server] Port ${env.PORT} is already in use by another process. ` +
            `Please terminate the conflicting process or change your port by setting PORT in your .env file.\n` +
            `Commands to identify conflicting process: lsof -i :${env.PORT}\n` +
            `Command to terminate it: kill -9 <PID>`
        );
        process.exit(1);
      } else {
        logger.error('[Server] Server encountered an error:', err);
        process.exit(1);
      }
    });

    server.listen(env.PORT, () => {
      logger.info(`[Server] Listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Server] Bootstrap failed to start: ${errorMessage}`);
    process.exit(1);
  }
};

// Monitor uncaught exception events
process.on('uncaughtException', (error: Error) => {
  logger.error('[Server] Uncaught Exception encountered:', error);
  handleShutdown('uncaughtException', 1);
});

// Monitor unhandled promise rejection events
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('[Server] Unhandled Rejection encountered:', reason);
  handleShutdown('unhandledRejection', 1);
});

// Register signals
process.on('SIGTERM', () => {
  handleShutdown('SIGTERM', 0);
});
process.on('SIGINT', () => {
  handleShutdown('SIGINT', 0);
});

bootstrap();

