import express from 'express';
import productModule from '../modules/productModule.js';
import { verifyAdmin }
from "../middleware/adminMiddleware.js";

const router = express.Router();


// ================= CUSTOMER =================

// Lấy toàn bộ sản phẩm
router.get( '/', productModule.getAllProducts);

// Tìm kiếm
router.get('/search', productModule.searchProducts);

// Theo category
router.get('/category/:id', productModule.getProductsByCategory);

// Chi tiết sản phẩm
router.get('/:id', productModule.getProductDetail);


export default router;