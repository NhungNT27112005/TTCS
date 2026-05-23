import { connectDB } from '../config/db.js';
import sql from 'mssql';

class CartDAO {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng của user chưa
    async checkItemInCart(userId, productId) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("userId", sql.VarChar(20), userId)
            .input("productId", sql.Int, productId)
            .query("SELECT * FROM dbo.Carts WHERE user_id = @userId AND product_id = @productId");
        return result.recordset;
    }

    // Cập nhật tăng số lượng của sản phẩm đã tồn tại trong giỏ
    async updateQuantity(userId, productId, quantity) {
        const pool = await connectDB();
        await pool
            .request()
            .input("userId", sql.VarChar(20), userId)
            .input("productId", sql.Int, productId)
            .input("qty", sql.Int, quantity)
            .query("UPDATE dbo.Carts SET quantity = quantity + @qty WHERE user_id = @userId AND product_id = @productId");
    }

    // Thêm mới hoàn toàn một sản phẩm vào giỏ hàng
    async insertToCart(userId, productId, quantity) {
        const pool = await connectDB();
        await pool
            .request()
            .input("userId", sql.VarChar(20), userId)
            .input("productId", sql.Int, productId)
            .input("qty", sql.Int, quantity)
            .query("INSERT INTO dbo.Carts (user_id, product_id, quantity) VALUES (@userId, @productId, @qty)");
    }

    // Lấy danh sách sản phẩm trong giỏ hàng (kèm thông tin chi tiết từ bảng Products)
    async getCartByUserId(userId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("userId", sql.VarChar(20), userId)
            .query(`
                SELECT c.cart_id, c.quantity, p.product_name, 
                       p.unit_price, p.thumbnail_url AS image_url, p.product_id
                FROM dbo.Carts c
                JOIN dbo.Products p ON c.product_id = p.product_id
                WHERE c.user_id = @userId
            `);
        return result.recordset;
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    async removeItemFromCart(userId, productId) {
        const pool = await connectDB();
        await pool.request()
            .input("userId", sql.VarChar(20), userId)
            .input("productId", sql.Int, productId)
            .query("DELETE FROM dbo.Carts WHERE user_id = @userId AND product_id = @productId");
    }
}

export default new CartDAO();