import { connectDB } from '../config/db.js';
import sql from 'mssql';

class OrderDAO {
    // 1. Gom toàn bộ sản phẩm trong giỏ hàng và thông tin tồn kho tương ứng
    async getCartItemsWithStock(customerId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("customerId", sql.VarChar(20), customerId)
            .query(`
                SELECT c.product_id, c.quantity, p.unit_price, p.stock_quantity, p.warranty_period
                FROM dbo.Carts c
                JOIN dbo.Products p ON c.product_id = p.product_id
                WHERE c.user_id = @customerId
            `);
        return result.recordset;
    }

    // 2. Chèn thông tin tổng quan vào bảng Orders (Chạy bên trong Transaction)
    async insertOrder(transaction, orderData) {
        await transaction.request()
            .input("orderId", sql.VarChar(20), orderData.newOrderId)
            .input("customerId", sql.VarChar(20), orderData.customerId)
            .input("address", sql.NVarChar(255), orderData.delivery_address)
            .input("total", sql.Decimal(18, 2), orderData.totalCost)
            .input("payMethod", sql.VarChar(20), orderData.payment_method)
            .input("delivMethod", sql.VarChar(100), orderData.delivery_method)
            .input("note", sql.NVarChar(100), orderData.note || null)
            .query(`
                INSERT INTO dbo.Orders (
                    order_id, customer_id, delivery_address, total_cost, 
                    created_at, payment_method, order_status, note, delivery_method
                )
                VALUES (
                    @orderId, @customerId, @address, @total, 
                    GETDATE(), @payMethod, 'PENDING', @note, @delivMethod
                )
            `);
    }

    // 3. Chèn chi tiết từng món hàng vào bảng Order_details (Chạy bên trong Transaction)
    async insertOrderDetail(transaction, orderId, item) {
        await transaction.request()
            .input("orderId", sql.VarChar(20), orderId)
            .input("productId", sql.Int, item.product_id)
            .input("qty", sql.Int, item.quantity)
            .input("price", sql.Decimal(15, 2), item.unit_price)
            .input("warranty", sql.TinyInt, item.warranty_period || 12)
            .query(`
                INSERT INTO dbo.Order_details (
                    order_id, product_id, quantity, unit_price_at_sale, warranty_period_applied
                )
                VALUES (
                    @orderId, @productId, @qty, @price, @warranty
                )
            `);
    }

    // 4. Khấu trừ số lượng tồn kho của sản phẩm (Chạy bên trong Transaction)
    async decreaseProductStock(transaction, productId, quantity) {
        await transaction.request()
            .input("productId", sql.Int, productId)
            .input("qty", sql.Int, quantity)
            .query(`
                UPDATE dbo.Products 
                SET stock_quantity = stock_quantity - @qty
                WHERE product_id = @productId
            `);
    }

    // 5. Xóa sạch giỏ hàng của khách sau khi lên đơn thành công (Chạy bên trong Transaction)
    async clearCart(transaction, customerId) {
        await transaction.request()
            .input("customerId", sql.VarChar(20), customerId)
            .query("DELETE FROM dbo.Carts WHERE user_id = @customerId");
    }
    // Truy vấn lịch sử mua hàng từ bảng dbo.Orders
    async getOrderHistory(customerId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("customerId", sql.VarChar(20), customerId)
            .query(`
                SELECT order_id, delivery_address, total_cost, created_at, 
                       payment_method, order_status, note, delivery_method
                FROM dbo.Orders
                WHERE customer_id = @customerId
                ORDER BY created_at DESC
            `);
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
    async adminGetOrderDetailsById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.VarChar(20), id)
            .query(`
                SELECT od.*, p.product_name, p.thumbnail_url, o.order_status, o.created_at, u.username, u.email
                FROM Order_Details od
                JOIN Products p ON od.product_id = p.product_id
                JOIN Orders o ON od.order_id = o.order_id
                JOIN Users u ON o.customer_id = u.user_id
                WHERE od.order_id = @id
            `);
        return result.recordset;
    }

    // Lấy thông tin tóm tắt đơn hàng theo order_id
    async getOrderById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.VarChar(20), id)
            .query(`
                SELECT order_id, customer_id, order_status, total_cost, delivery_address, payment_method, delivery_method, note, created_at
                FROM Orders
                WHERE order_id = @id
            `);
        return result.recordset[0];
    }

// Cập nhật trạng thái đơn hàng (đã viết hoa status)
    async updateOrderStatus(id, status) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.VarChar(20), id)
            .input('status', sql.VarChar(20), status.toUpperCase()) // Đảm bảo đúng chuẩn DB
            .query("UPDATE Orders SET order_status = @status WHERE order_id = @id");
    }

}

export default new OrderDAO();