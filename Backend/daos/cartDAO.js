import { connectDB } from '../config/db.js';
import sql from 'mssql';

class CartDAO {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng của user chưa
    async addOrUpdateCart(userId, productId, quantity) {
        const pool = await connectDB();
        await pool.request()
            .input("userId", sql.VarChar(20), userId)
            .input("productId", sql.Int, productId)
            .input("qty", sql.Int, quantity)
            .execute("sp_AddOrUpdateCart");
    }

    // Lấy danh sách sản phẩm trong giỏ hàng (kèm thông tin chi tiết từ bảng Products)
    async getCartByUserId(userId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("userId", sql.VarChar(20), userId)
            .execute("sp_GetCartByUserId");
        return result.recordset;
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    async removeItemFromCart(userId, productId) {
        const pool = await connectDB();
        await pool.request()
            .input("userId", sql.VarChar(20), userId)
            .input("productId", sql.Int, productId)
            .execute("sp_RemoveItemFromCart");
    }
}

export default new CartDAO();