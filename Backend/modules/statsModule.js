// modules/statsModule.js
import statsDAO from '../daos/statsDAO.js'; // 🌟 Import lớp DAO vừa tạo

class StatsModule {
    
    getDashboardStats = async (req, res) => {
        try {
            // 1. Module gọi xuống DAO để lấy dữ liệu (Không chứa một dòng SQL nào ở đây)
            const generalStats = await statsDAO.getGeneralStats();
            const lowStockProducts = await statsDAO.getLowStockProducts();
            const recentOrders = await statsDAO.getRecentOrders();

            // 2. Gom dữ liệu lại và đóng gói phản hồi HTTP trả về cho FrontEnd Axios
            return res.status(200).json({
                ...generalStats,
                lowStockProducts,
                recentOrders
            });

        } catch (err) {
            console.error("❌ LỖI TẠI StatsModule - getDashboardStats:", err.message);
            return res.status(500).json({ message: "Lỗi hệ thống khi tải thống kê!" });
        }
    }
}

export default new StatsModule();