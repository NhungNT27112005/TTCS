import express from "express";
import cors from "cors";
import { connectDB } from "./db.js"; 

import productRoutes from "./routes/product.js";
import orderRoutes from './routes/order.js';
import dashboardRoutes from './routes/dashboard.js';
import categoryRoutes from './routes/category.js';
import userRoutes from './routes/user.js';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", dashboardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

connectDB();


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`>>> E-TECH SERVER IS RUNNING AT: http://localhost:${PORT}`);
});