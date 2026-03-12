import express from 'express';
import { getShelfLives, addShelfLife } from '../controllers/shelflife.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getShelfLives)
    .post(authorize('Farmer'), addShelfLife);

export default router;
