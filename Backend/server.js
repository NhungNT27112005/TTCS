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
import notificationRoutes from "./routes/notificationsRoutes.js";

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
app.use('/api/notifications', notificationRoutes);
app.post('/chat', handleChat); // Endpoint cho chatbot


// --- 5. KHỞI CHẠY SERVER TỔNG ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`>>> E-TECH SERVER IS RUNNING AT: http://localhost:${PORT}`);
});