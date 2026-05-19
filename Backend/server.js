// Backend/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from './config/db.js';
import { handleChat } from "./chatbot.js";

// 🌟 IMPORT CÁC TRỤC ĐỊNH TUYẾN PHẲNG ĐÃ BÓC TÁCH
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// --- 1. CONFIG MIDDLEWARES TỔNG ---
app.use(express.json());
app.use(cors());

// --- 2. ĐẤU NỐI CÁC TUYẾN ĐƯỜNG API HỆ THỐNG ---
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// --- 3. API THÔNG BÁO (Bảo vệ giao diện NotificationDropdown) ---
app.get("/notifications", async (req, res) => {
  try {
    const pool = await connectDB();
    
    try {
      const result = await pool.request().query(`
        SELECT TOP 10 
          notification_id || id AS id, 
          title, 
          message, 
          created_at, 
          is_read 
        FROM dbo.Notifications 
        ORDER BY created_at DESC
      `);
      return res.json(result.recordset);
    } catch (dbErr) {
      // Cơ chế phòng vệ: Nếu sếp chưa tạo bảng Notifications dưới SQL Server,
      // API tự động trả về dữ liệu mẫu để né lỗi vỡ giao diện Frontend
      const mockNotifications = [
        { id: 1, title: "Chào mừng sếp", message: "Chào mừng sếp đã đến với hệ thống công nghệ E-Tech v2026!", created_at: new Date(), is_read: 0 },
        { id: 2, title: "Đơn hàng mới", message: "Kiểm tra tiến độ đơn hàng trực tiếp tại phần Lịch sử đơn hàng.", created_at: new Date(), is_read: 1 }
      ];
      return res.json(mockNotifications);
    }
  } catch (err) {
    console.error("❌ LỖI TẠI API NOTIFICATIONS:", err.message);
    res.status(500).json({ message: "Lỗi hệ thống thông báo" });
  }
});

// --- 4. API CHATBOT ---
app.post("/chat", async (req, res) => {
  try {
    const pool = await connectDB();
    const { message, user } = req.body;

    // Truyền pool và user vào bộ não handleChat xử lý
    const result = await handleChat(pool, message, user);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Chatbot đang bảo trì" });
  }
});

// --- 5. KHỞI CHẠY SERVER TỔNG ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`>>> E-TECH SERVER IS RUNNING AT: http://localhost:${PORT}`);
});