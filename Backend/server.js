// Backend/server.js
import "dotenv/config";
import sql from "mssql";
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

// --- 3. KẾT NỐI DATABASE ---
const dbConfig = {
   user:
   process.env.DB_USER,

   password:
   process.env.DB_PASSWORD,

   server:
   process.env.DB_SERVER,

   database:
   process.env.DB_DATABASE,

   port:
   Number(
      process.env.DB_PORT
   ),

   options:{
      encrypt:true,
      trustServerCertificate:true
   }
};
// tạo pool
const pool =
await sql.connect(
   dbConfig
);

// chatbot 
app.post(
"/chat",
async(req,res)=>{

   try{

      const {
         message,
         user
      } = req.body;

      const reply =
      await handleChat(
         pool,     // 🔥 PHẢI CÓ
         message,
         user
      );

      res.json({
         success:true,
         data:{
            reply
         }
      });

   }catch(error){

      console.error(
         error.message
      );

      res.status(500)
      .json({
         message:
         error.message
      });
   }
});
connectDB(dbConfig);
// --- 5. KHỞI CHẠY SERVER TỔNG ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`>>> E-TECH SERVER IS RUNNING AT: http://localhost:${PORT}`);
});