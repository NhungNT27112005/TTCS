import "dotenv/config";
import express from "express";
import cors from "cors";

// Import các file định tuyến chuẩn dự án
import userRoutes from "./routes/userRoutes.js";
import adminproductRouter from "./routes/adminproductRoutes.js";
import adminorderRouter from "./routes/adminorderRoutes.js";
import notificationRoutes from "./routes/notificationsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
const app = express();
app.use(express.json());
app.use(cors());

// =========================================================================
// ĐĂNG KÝ CÁC ROUTE VÀO HỆ THỐNG SERVER GỐC
// Các tiền tố phân biệt /admin đã được định nghĩa trực tiếp bên trong cấu trúc route.
// =========================================================================
app.use("/api/admin/auth", userRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/products", adminproductRouter);
app.use("/api/admin/orders", adminorderRouter);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/admin/stats", statsRoutes);

const PORT = process.env.ADMIN_PORT || 5001;
app.listen(PORT, () => {
    console.log(`>>> HỆ THỐNG ADMIN BACKEND ĐANG CHẠY BẢO MẬT TẠI PORT: ${PORT}`);
});