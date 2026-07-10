import { Router } from 'express';

import analyticsRouter from './analytics.routes.js';
import linkRouter from './link.routes.js';

const apiRouter = Router();

apiRouter.use('/links', linkRouter);
apiRouter.use('/analytics', analyticsRouter);

export default apiRouter;
