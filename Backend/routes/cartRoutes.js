import express from 'express';
import cartModule from '../modules/cartModule.js'; 
import { authenticateToken } from '../middleware/middleware.js';

const router = express.Router();

// Tất cả các cổng API của cụm Cart đều được bảo vệ nghiêm ngặt bằng Token
router.post('/add', authenticateToken, cartModule.addToCart);
router.get('/:userId', authenticateToken, cartModule.getCart);

export default router;