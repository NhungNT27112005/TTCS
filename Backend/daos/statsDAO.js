// daos/statsDAO.js
import { connectDB } from '../config/db.js';

class StatsDAO {
    /**
     * Lấy các con số thống kê tổng quan từ SQL Server
     */
    async getGeneralStats() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Users) as totalUsers,
                (SELECT COUNT(*) FROM Products) as totalProducts,
                (SELECT COUNT(*) FROM Orders) as totalOrders,
                (SELECT SUM(total_cost) FROM Orders WHERE order_status != 'CANCELLED') as totalRevenue,
                (SELECT COUNT(*) FROM Orders WHERE order_status = 'PENDING') as pendingOrders
        `);
        return result.recordset[0];
    }

    /**
     * Lấy top 5 sản phẩm có số lượng tồn kho thấp hơn 10
     */
    async getLowStockProducts() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT TOP 5 product_id, product_name, stock_quantity 
            FROM Products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC
        `);
        return result.recordset;
    }

    /**
     * Lấy top 5 đơn hàng mới phát sinh gần đây nhất
     */
    async getRecentOrders() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT TOP 5 o.order_id, u.username, o.total_cost, o.order_status
            FROM Orders o JOIN Users u ON o.customer_id = u.user_id
            ORDER BY o.created_at DESC
        `);
        return result.recordset;
    }
}

export default new StatsDAO();