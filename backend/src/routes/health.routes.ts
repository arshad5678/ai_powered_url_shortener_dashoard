import { Router } from 'express';

import { healthCheck, livenessCheck, readinessCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/ready', readinessCheck);
router.get('/live', livenessCheck);

export default router;
