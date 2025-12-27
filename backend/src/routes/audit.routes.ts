import { Router } from 'express';
import { validateCheckIn, getProviderSLA } from '../controllers/audit.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.post('/check-in', protect, restrictTo('TECHNICIAN', 'ADMIN'), validateCheckIn);
router.get('/sla/:providerId', protect, restrictTo('ADMIN', 'AUDITOR'), getProviderSLA);

export default router;
