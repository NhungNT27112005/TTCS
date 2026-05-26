import { connectDB } from '../config/db.js';
import sql from 'mssql';

class OrderDAO {
    // 1. Gom toàn bộ sản phẩm trong giỏ hàng và thông tin tồn kho tương ứng
    async checkout(userData, orderData) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("user_id", sql.VarChar(20), userData.customerId)
            .input("order_id", sql.VarChar(20), orderData.newOrderId)
            .input("delivery_addr", sql.NVarChar(255), orderData.delivery_address)
            .input("payment_method", sql.VarChar(20), orderData.payment_method)
            .input("delivery_method", sql.VarChar(100), orderData.delivery_method)
            .output("success", sql.Bit)
            .output("message", sql.NVarChar(255))
            .execute("sp_CheckoutOrder");

        return { success: result.output.success, message: result.output.message };
    }
    // Truy vấn lịch sử mua hàng từ bảng dbo.Orders
    async getOrderHistory(customerId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("customerId", sql.VarChar(20), customerId)
            .execute("sp_GetOrderHistory");
        return result.recordset;
    }
    //admin
    // Lấy danh sách toàn bộ đơn hàng cho trang Quản lý đơn hàng Admin
    async adminGetAllOrders() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT o.order_id, o.customer_id, o.delivery_address, o.total_cost, 
                   o.order_status, o.created_at, u.username, u.phone_number 
            FROM Orders o 
            JOIN Users u ON o.customer_id = u.user_id
            ORDER BY o.created_at DESC
        `);
        return result.recordset;
    }
    // CHI TIẾT ĐƠN HÀNG - Đảm bảo tên hàm đúng như này
    async getOrderDetailsById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.VarChar(20), id)
            .execute('sp_GetOrderDetails');
        return result.recordset;
    }

    // Lấy thông tin tóm tắt đơn hàng theo order_id
    async getOrderById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.VarChar(20), id)
            .execute('sp_GetOrderById');
        return result.recordset[0];
    }

// Cập nhật trạng thái đơn hàng (đã viết hoa status)
    async updateOrderStatus(id, status) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.VarChar(20), id)
            .input('status', sql.VarChar(20), status.toUpperCase()) // Đảm bảo đúng chuẩn DB
            .execute('sp_UpdateOrderStatus');
    }

}

export default new OrderDAO();