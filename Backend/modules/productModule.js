import productDAO from '../daos/productDAO.js';

class ProductModule {
    // [NGHIỆP VỤ 1]: Lấy toàn bộ sản phẩm
    getAllProducts = async (req, res) => {
        try {
            const recordset = await productDAO.getAllProducts();
            res.json(recordset);
        } catch (err) {
            console.error("❌ Lỗi tại ProductModule - getAllProducts:", err.message);
            res.status(500).send("Error fetching products: " + err.message);
        }
    }

    // [NGHIỆP VỤ 2]: Lấy chi tiết một sản phẩm
    getProductDetail = async (req, res) => {
        try {
            const { id } = req.params;
            const recordset = await productDAO.getProductById(id);

            if (recordset.length > 0) {
                res.json(recordset[0]);
            } else {
                res.status(404).send("Không thấy sản phẩm");
            }
        } catch (err) {
            console.error("❌ Lỗi tại ProductModule - getProductDetail:", err.message);
            res.status(500).send("Lỗi lấy chi tiết");
        }
    }

    // [NGHIỆP VỤ 3]: Lấy sản phẩm theo danh mục
    getProductsByCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const recordset = await productDAO.getProductsByCategory(id);
            res.json(recordset);
        } catch (err) {
            console.error("❌ Lỗi tại ProductModule - getProductsByCategory:", err.message);
            res.status(500).send("Lỗi hệ thống");
        }
    }
    // [NGHIỆP VỤ 4]:  Tìm kiếm sản phẩm
    searchProducts = async (req, res) => {
        try {
            const { q } = req.query; // Lấy từ khóa tìm kiếm (Query Parameter) từ URL
            
            // Nếu khách không nhập từ khóa hoặc chỉ nhập khoảng trắng, trả về mảng trống
            if (!q || q.trim() === "") {
                return res.json([]);
            }

            // Gọi DAO bốc dữ liệu tìm kiếm tương ứng dưới SQL Server
            const recordset = await productDAO.searchProducts(q);
            res.json(recordset);
        } catch (err) {
            console.error("❌ LỖI TẠI ProductModule - searchProducts:", err.message);
            res.status(500).json({ message: "Lỗi hệ thống khi tìm kiếm: " + err.message });
        }
    }
    //admin
    async adminListProducts() {
        return await productDAO.getAllProductsWithCategory();
    }

    async adminAddProduct(data) {
        await productDAO.insertProduct(data);
    }

    async adminEditProduct(id, data) {
        await productDAO.updateProduct(id, data);
    }

    async adminDeleteProduct(id) {
        await productDAO.deleteProduct(id);
    }

    async adminListCategories() {
        return await productDAO.getAllCategories();
    }
}

export default new ProductModule();