import express from "express";
import sql from "mssql";
import { connectDB } from "../db.js";

const router = express.Router();

router.get("/product-suggest", async (req, res) => {
    try {

        const pool = await connectDB();

        const query = req.query.query || "";

        const result = await pool.request()
            .input("query", sql.NVarChar, query)
            .query(`
                SELECT TOP 5
                    p.product_id,
                    p.product_name,
                    p.unit_price,
                    p.brand,
                    p.thumbnail_url AS image_url,
                    SUM(od.quantity) AS total_sold
                FROM dbo.Products p
                JOIN dbo.Order_details od 
                    ON p.product_id = od.product_id
                GROUP BY 
                    p.product_id,
                    p.product_name,
                    p.unit_price,
                    p.brand,
                    p.thumbnail_url
                ORDER BY total_sold DESC
            `);

        res.json(result.recordset);

    } catch (err) {

        console.error("Lỗi Product Suggest:", err);

        res.status(500).send("Lỗi khi lấy gợi ý sản phẩm");
    }
});

export default router;