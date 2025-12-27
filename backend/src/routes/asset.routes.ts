import { Router } from 'express';
import { getAssets, getAssetById, updateAssetStatus } from '../controllers/asset.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.patch('/:id/status', protect, restrictTo('ADMIN', 'TECHNICIAN'), updateAssetStatus);

export default router;
