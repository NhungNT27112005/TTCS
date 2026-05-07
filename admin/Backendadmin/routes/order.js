import express from 'express';
import cors from 'cors';
import { connectDB } from "../db.js";

const routes = express.Router();

routes.use(express.json());
routes.use(cors());

// DANH SÁCH ĐƠN HÀNG

routes.get("/", async (req, res) => {

    try {

        const pool = await connectDB();

        const result = await pool.request()

            .query(`

                SELECT

                    o.order_id,
                    u.username,
                    u.email,
                    u.phone_number,

                    o.created_at,
                    o.total_cost,
                    o.delivery_address,
                    o.order_status

                FROM Orders o

                JOIN Users u
                ON o.customer_id = u.user_id

                ORDER BY o.created_at DESC
            `);

        res.status(200).json(
            result.recordset
        );

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Lỗi server!"
        });
    }
});


// ======================================
// CHI TIẾT ĐƠN HÀNG
// ======================================

routes.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const pool = await connectDB();

        const result = await pool.request()

            .input('id', id)

            .query(`

                SELECT

                    od.detail_id,
                    od.quantity,
                    od.unit_price_at_sale,
                    od.warranty_period_applied,

                    p.product_name,
                    p.thumbnail_url,

                    o.order_id,
                    o.total_cost,
                    o.created_at,
                    o.order_status,

                    u.username,
                    u.email

                FROM Order_details od

                JOIN Products p
                ON od.product_id = p.product_id

                JOIN Orders o
                ON od.order_id = o.order_id

                JOIN Users u
                ON o.customer_id = u.user_id

                WHERE o.order_id = @id
            `);

        res.status(200).json(
            result.recordset
        );

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});


// ======================================
// UPDATE STATUS
// ======================================

routes.put("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        const pool = await connectDB();

        await pool.request()

            .input('id', id)

            .input('status', status)

            .query(`

                UPDATE Orders

                SET order_status = @status

                WHERE order_id = @id
            `);

        res.json({

            message:
                'Cập nhật đơn hàng thành công!',
                 updatedStatus: status
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});

export default routes;