import "dotenv/config";
import express from "express";
import cors from "cors";

// Import các file định tuyến chuẩn dự án
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

// =========================================================================
// ĐĂNG KÝ CÁC ROUTE VÀO HỆ THỐNG SERVER GỐC
// Các tiền tố phân biệt /admin đã được định nghĩa trực tiếp bên trong cấu trúc route.
// =========================================================================
app.use("/", userRoutes);    
app.use("/", productRoutes); 
app.use("/", orderRoutes);   

const PORT = process.env.ADMIN_PORT ;
app.listen(PORT, () => {
    console.log(`>>> HỆ THỐNG ADMIN BACKEND ĐANG CHẠY BẢO MẬT TẠI PORT: ${PORT}`);
});