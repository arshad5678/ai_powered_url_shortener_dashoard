import compression from 'compression';
import cors from 'cors';
import express from 'express';

import { corsOptions } from './config/cors.js';
import { helmetConfig } from './config/helmet.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import healthRouter from './routes/health.routes.js';
import apiRouter from './routes/index.js';
import redirectRouter from './routes/redirect.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

const app = express();

// 1. Disable x-powered-by to prevent software fingerprinting leaks
app.disable('x-powered-by');

// 2. Register Helmet headers to restrict client loading boundaries
app.use(helmetConfig);

// 3. Configure Cross-Origin Resource Sharing bindings
app.use(cors(corsOptions));

// 4. Register compression to optimize transfer rates
app.use(compression());

// 5. Parse incoming request payloads formatted in JSON
app.use(express.json());

// 6. Parse incoming URL-encoded request payloads
app.use(express.urlencoded({ extended: true }));

// 7. Inject unique tracking keys for context tracing
app.use(requestId);

// 8. Register request auditor middleware mapping to Winston logger
app.use(requestLogger);

// 9. Application Routes
app.use('/', healthRouter);
app.use('/api', apiRouter);
app.use('/r', redirectRouter);

// 10. Swagger API documentation UI route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 11. Intercept and capture unmatched endpoint requests
app.use(notFound);

// 12. Global error handler middleware
app.use(errorHandler);

export default app;


