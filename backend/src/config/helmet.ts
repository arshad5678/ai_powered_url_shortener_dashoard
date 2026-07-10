import helmet from 'helmet';

import { env } from './env.js';

export const helmetConfig = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
});
