import express from 'express';
import cors from 'cors';
import { connectDB } from "../db.js"; 
const routes = express.Router();
routes.use(express.json());
routes.use(cors());

// api lấy tất cả danh mục
routes.get("/category", async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                SELECT * FROM Categories
            `);
        res.status(200).json(result.recordset);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
});

export default routes;