import express from "express";
import sql from "mssql";
import { connectDB } from "../db.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
    try {
        const pool = await connectDB();

        // Tổng users
        const usersResult = await pool.request().query(`
            SELECT COUNT(*) AS totalUsers
            FROM Users
        `);

        // Tổng products
        const productsResult = await pool.request().query(`
            SELECT COUNT(*) AS totalProducts
            FROM Products
        `);

        // Tổng orders
        const ordersResult = await pool.request().query(`
            SELECT COUNT(*) AS totalOrders
            FROM Orders
        `);

        // Doanh thu
        const revenueResult = await pool.request().query(`
            SELECT ISNULL(SUM(total_cost), 0) AS totalRevenue
            FROM Orders
            WHERE order_status = 'DELIVERED'
        `);

        // Đơn pending
        const pendingResult = await pool.request().query(`
            SELECT COUNT(*) AS pendingOrders
            FROM Orders
            WHERE order_status = 'PENDING'
        `);

        // Sản phẩm sắp hết
        const lowStockResult = await pool.request().query(`
            SELECT TOP 5
                product_id,
                product_name,
                stock_quantity
            FROM Products
            WHERE stock_quantity <= 5
            ORDER BY stock_quantity ASC
        `);

        // Đơn gần đây
        const recentOrdersResult = await pool.request().query(`
            SELECT TOP 5
                o.order_id,
                o.total_cost,
                o.order_status,
                o.created_at,
                u.username
            FROM Orders o
            JOIN Users u
            ON o.customer_id = u.user_id
            ORDER BY o.created_at DESC
        `);

        res.json({
            totalUsers: usersResult.recordset[0].totalUsers,
            totalProducts: productsResult.recordset[0].totalProducts,
            totalOrders: ordersResult.recordset[0].totalOrders,
            totalRevenue: revenueResult.recordset[0].totalRevenue,
            pendingOrders: pendingResult.recordset[0].pendingOrders,
            lowStockProducts: lowStockResult.recordset,
            recentOrders: recentOrdersResult.recordset
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Server error"
        });
    }
});

export default router;