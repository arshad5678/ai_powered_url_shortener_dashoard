import { createClient, RedisClientType } from 'redis';

import { env } from '../config/env.js';
import { logger } from '../logger/index.js';

let redisClient: RedisClientType | null = null;

/**
 * Initializes and retrieves the Redis client singleton instance.
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    redisClient = createClient({
      url: env.REDIS_URL,
    }) as RedisClientType;

    redisClient.on('error', (err) => {
      logger.error(`[Redis] Client error encountered: ${err.message}`, { err });
    });

    redisClient.on('connect', () => {
      logger.info('[Redis] Client connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('[Redis] Client successfully connected and ready.');
    });
  }
  return redisClient;
};

/**
 * Connects to Redis server during application startup.
 */
export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[Redis] Connection failed: ${msg}`);
      throw err;
    }
  }
};

/**
 * Disconnects from Redis server gracefully during application shutdown.
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    try {
      logger.info('[Redis] Disconnecting client gracefully...');
      await redisClient.quit();
      logger.info('[Redis] Client disconnected successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[Redis] Disconnection failed: ${msg}`);
    }
  }
};

export const redis = getRedisClient();
