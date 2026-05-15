import express from "express";
import sql from "mssql";
import { connectDB } from "../db.js";

const router = express.Router();
const app = express();
app.use(express.json());


router.get("/", async (req, res) => {

    const pool = await connectDB();

    const orders = await pool.request().query(`
        SELECT TOP 5
            order_id,
            order_status
        FROM Orders
        ORDER BY created_at DESC
    `);

    const notifications = orders.recordset.map(order => ({
        id: order.order_id,
        type: "order",
        message: `Đơn hàng #${order.order_id} đang ${order.order_status}`
    }));

    res.json(notifications);

});
export default router;