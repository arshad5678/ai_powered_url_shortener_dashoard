import { CorsOptions } from 'cors';

import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};
