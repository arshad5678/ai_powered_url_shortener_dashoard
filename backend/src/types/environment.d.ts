declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      DATABASE_URL?: string;
      REDIS_URL?: string;
      FRONTEND_URL?: string;
      GEMINI_API_KEY?: string;
      JWT_SECRET?: string;
      LOG_LEVEL?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
    }
  }
}

export {};
