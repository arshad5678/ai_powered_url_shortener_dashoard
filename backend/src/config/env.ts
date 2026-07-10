import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  REDIS_URL: z
    .string()
    .regex(/^rediss?:\/\//, 'REDIS_URL must be a valid Redis connection string starting with redis:// or rediss://'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  GEMINI_API_KEY: z.string().optional().default(''),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment validation failed:');
    const formatted = result.error.format();

    // Iterate and print descriptive errors
    for (const [key, value] of Object.entries(formatted)) {
      if (key !== '_errors' && value && '_errors' in value) {
        console.error(`  - ${key}: ${value._errors.join(', ')}`);
      }
    }

    throw new Error('Missing or invalid environment configuration');
  }

  return result.data;
};

// Validate and export environment configurations
export const env = Object.freeze(validateEnv());
export type Env = z.infer<typeof envSchema>;
