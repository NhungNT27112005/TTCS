import express from 'express';
import productModule from '../modules/productModule.js';
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get('/', productModule.getAllProducts);  
router.get('/search', productModule.searchProducts);             // Endpoint: GET /api/products
router.get('/:id', productModule.getProductDetail);          // Endpoint: GET /api/products/:id
router.get('/category/:id', productModule.getProductsByCategory); // Endpoint: GET /api/products/category/:id

// --- ROUTE ADMIN THAO TÁC HÀNG HÓA ---
// Lấy toàn bộ sản phẩm phía quản trị (Đường dẫn sau khi map: GET /admin/products/products)
router.get("/admin/products/products", verifyAdmin, async (req, res) => {
    try { 
        res.json(await productModule.adminListProducts()); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// Thêm mới sản phẩm (Đường dẫn sau khi map: POST /admin/products)
router.post("/admin/products", verifyAdmin, async (req, res) => {
    try { 
        await productModule.adminAddProduct(req.body); 
        res.status(201).json({ message: "Thêm thành công" }); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// Cập nhật sản phẩm (Đường dẫn sau khi map: PUT /admin/products/:id)
router.put("/admin/products/:id", verifyAdmin, async (req, res) => {
    try { 
        await productModule.adminEditProduct(req.params.id, req.body); 
        res.json({ message: "Cập nhật thành công" }); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// Xóa sản phẩm (Đường dẫn sau khi map: DELETE /admin/products/:id)
router.delete("/admin/products/:id", verifyAdmin, async (req, res) => {
    try { 
        await productModule.adminDeleteProduct(req.params.id); 
        res.json({ message: "Đã xóa sản phẩm thành công" }); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// Lấy danh mục cho Modal Sản phẩm (Đường dẫn sau khi map: GET /admin/categories/category)
router.get("/admin/categories/category", verifyAdmin, async (req, res) => {
    try { 
        res.json(await productModule.adminListCategories()); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

export default router;