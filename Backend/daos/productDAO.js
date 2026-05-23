import { connectDB } from '../config/db.js';
import sql from 'mssql';

class ProductDAO {
    // 1. Lấy danh sách 163 sản phẩm hàng đầu
    async getAllProducts() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT TOP 163 
                product_id,
                product_name,
                cat_id,
                specs_json, 
                unit_price,
                stock_quantity,
                brand,
                warranty_period, 
                thumbnail_url AS image_url
            FROM dbo.Products 
        `);
        return result.recordset;
    }

    // 2. Lấy thông tin chi tiết một sản phẩm theo ID
    async getProductById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT *, thumbnail_url as image_url FROM dbo.Products WHERE product_id = @id");
        return result.recordset;
    }

    // 3. Lấy danh sách sản phẩm dựa vào mã danh mục (cat_id)
    async getProductsByCategory(catId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('catId', sql.INT, catId)
            .query(`
                SELECT 
                    product_id, 
                    product_name, 
                    cat_id, 
                    unit_price, 
                    brand, 
                    thumbnail_url AS image_url 
                FROM dbo.Products
                WHERE cat_id = @catId
            `);
        return result.recordset;
    }
    // 4. Truy vấn tìm kiếm sản phẩm theo tên hoặc thương hiệu
    async searchProducts(keyword) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("keyword", sql.NVarChar, `%${keyword.trim()}%`)
            .query(`
                SELECT 
                  product_id,
                  product_name,
                  cat_id,
                  unit_price,
                  brand,
                  thumbnail_url AS image_url
                FROM dbo.Products
                WHERE product_name LIKE @keyword 
                   OR brand LIKE @keyword
            `);
        return result.recordset;
    }
    //admin
    async getAllProductsWithCategory() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT p.*, c.cat_name 
            FROM dbo.Products p 
            LEFT JOIN dbo.Categories c ON p.cat_id = c.cat_id
        `);
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
            .query(`
                INSERT INTO dbo.Products (product_name, brand, specs_json, unit_price, stock_quantity, warranty_period, thumbnail_url, cat_id)
                VALUES (@name, @brand, @specs, @price, @stock, @warranty, @img, @cat)
            `);
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
            .query(`
                UPDATE dbo.Products SET 
                product_name = @name, brand = @brand, specs_json = @specs, 
                unit_price = @price, stock_quantity = @stock, warranty_period = @warranty, 
                thumbnail_url = @img, cat_id = @cat 
                WHERE product_id = @id
            `);
    }

    async deleteProduct(id) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM dbo.Products WHERE product_id = @id");
    }

    async getAllCategories() {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT cat_id, cat_name FROM dbo.Categories");
        return result.recordset;
    }
}

export default new ProductDAO();