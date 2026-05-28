import express from 'express';
import orderModule from '../modules/orderModule.js';
import { authenticateToken } from '../middleware/middleware.js';
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Tiếp nhận yêu cầu POST thanh toán hóa đơn giỏ hàng
router.post('/checkout', authenticateToken, orderModule.checkout);

router.get('/history', authenticateToken, orderModule.getOrderHistory);

// Khách hàng: cập nhật trạng thái đơn (ví dụ xác nhận đã chuyển khoản -> chuyển PENDING -> SHIPPING)
router.put('/:id/status', authenticateToken, orderModule.customerUpdateOrderStatus);
router.get('/:id/details', authenticateToken, orderModule.getOrderDetailsForCustomer);

export default router;