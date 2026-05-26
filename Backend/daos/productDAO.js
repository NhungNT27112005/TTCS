import { connectDB } from '../config/db.js';
import sql from 'mssql';

class ProductDAO {
    // 1. Lấy danh sách 163 sản phẩm hàng đầu
    async getAllProducts() {
        const pool = await connectDB();
        const result = await pool.request().execute('sp_GetAllProducts');
        return result.recordset;
    }

    // 2. Lấy thông tin chi tiết một sản phẩm theo ID
    async getProductById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_GetProductById');
        return result.recordset;
    }

    // 3. Lấy danh sách sản phẩm dựa vào mã danh mục (cat_id)
    async getProductsByCategory(catId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('catId', sql.INT, catId)
            .execute('sp_GetProductsByCategory');
        return result.recordset;
    }
    // 4. Truy vấn tìm kiếm sản phẩm theo tên hoặc thương hiệu
    async searchProducts(keyword) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("keyword", sql.NVarChar, `%${keyword.trim()}%`)
            .execute('sp_SearchProducts');
        return result.recordset;
    }
    //admin
    async getAllProductsWithCategory() {
        const pool = await connectDB();
        const result = await pool.request().execute('sp_GetAllProductsWithCategory');
        return result.recordset;
    }

    async insertProduct(p) {
        const pool = await connectDB();
        await pool.request()
            .input('name', sql.NVarChar(500), p.product_name)
            .input('brand', sql.VarChar(30), p.brand)
            .input('specs', sql.NVarChar(sql.MAX), p.specs_json)
            .input('price', sql.Decimal(15, 2), p.unit_price)
            .input('stock', sql.Int, p.stock_quantity)
            .input('warranty', sql.TinyInt, p.warranty_period)
            .input('img', sql.VarChar(500), p.thumbnail_url)
            .input('cat', sql.Int, p.cat_id)
            .execute('sp_InsertProduct');
    }

    async updateProduct(id, p) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar(500), p.product_name)
            .input('brand', sql.VarChar(30), p.brand)
            .input('specs', sql.NVarChar(sql.MAX), p.specs_json)
            .input('price', sql.Decimal(15, 2), p.unit_price)
            .input('stock', sql.Int, p.stock_quantity)
            .input('warranty', sql.TinyInt, p.warranty_period)
            .input('img', sql.VarChar(500), p.thumbnail_url)
            .input('cat', sql.Int, p.cat_id)
            .execute('sp_UpdateProduct');
    }

    async deleteProduct(id) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .execute('sp_DeleteProduct');
    }

    async getAllCategories() {
        const pool = await connectDB();
        const result = await pool.request().execute('sp_GetAllCategories');
        return result.recordset;
    }
}

export default new ProductDAO();