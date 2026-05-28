// daos/statsDAO.js
import { connectDB } from '../config/db.js';

class StatsDAO {
    /**
     * Lấy các con số thống kê tổng quan từ SQL Server
     */
    async getGeneralStats() {
        const pool = await connectDB();
        const result = await pool.request().execute('sp_GetGeneralStats');
        return result.recordset[0];
    }

    /**
     * Lấy top 5 sản phẩm có số lượng tồn kho thấp hơn 10
     */
    async getLowStockProducts() {
        const pool = await connectDB();
        const result = await pool.request().execute('sp_GetLowStockProducts');
        return result.recordset;
    }

    /**
     * Lấy top 5 đơn hàng mới phát sinh gần đây nhất
     */
    async getRecentOrders() {
        const pool = await connectDB();
        const result = await pool.request().execute('sp_GetRecentOrders');
        return result.recordset;
    }
}

export default new StatsDAO();