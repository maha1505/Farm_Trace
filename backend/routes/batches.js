import express from 'express';
import { registerBatch, getBatches, updateBatchStatus } from '../controllers/batches.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .post(authorize('Farmer'), registerBatch)
    .get(getBatches);

router.put('/:id/status', protect, updateBatchStatus);

export default router;
