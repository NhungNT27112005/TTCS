import express from 'express';
import aiModule from '../modules/aiModule.js'; // Nhập thực thể lớp module vừa tạo

const router = express.Router();

// Định nghĩa các cổng kết nối khép kín
router.get('/similar-products/:productId', aiModule.getSimilarProducts);
router.get('/personalized/:userId',       aiModule.getPersonalized);
router.post('/personalized-from-cart',    aiModule.getPersonalizedFromCart);
router.post('/refresh-cart',               aiModule.triggerRefreshCart);

export default router;