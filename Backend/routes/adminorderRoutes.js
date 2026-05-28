import express from 'express';
import orderModule from '../modules/orderModule.js';
import { authenticateToken } from '../middleware/middleware.js';
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// --- ROUTE ADMIN THAO TÁC ĐƠN HÀNG & THỐNG KÊ ---
// Lấy toàn bộ sản phẩm phía quản trị (Đường dẫn sau khi map: GET /admin/products/products)
router.get("/", verifyAdmin, orderModule.adminListOrders);
router.get("/:id", verifyAdmin, orderModule.adminGetOrderDetail);
router.put("/:id", verifyAdmin, orderModule.adminUpdateOrderStatus);

export default router;