import express from 'express';
import cors from 'cors';
import { connectDB } from "../db.js"; 
const routes = express.Router();
routes.use(express.json());
routes.use(cors());


routes.get("/products", async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                 SELECT
                p.*,
                c.cat_name
            FROM Products p
            LEFT JOIN Categories c
            ON p.cat_id = c.cat_id
            ORDER BY p.product_id DESC
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

// api lấy chi tiết sản phẩm
routes.get("/products/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const pool = await connectDB();
        const result = await pool.request()
            .input('productId', productId)
            .query(`
                select * from dbo.Products
                where product_id = @productId
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: "Sản phẩm không tồn tại!"
            });
        }
        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Lỗi server!"
        });
    }
});


// api thêm sản phẩm mới
routes.post("/products", async (req, res) => {

    try {

        const {
            product_name,
            brand,
            specs_json, 
            unit_price,
            stock_quantity,
            thumbnail_url,
            cat_id
        } = req.body;

        const pool = await connectDB();

        await pool.request()

            .input("product_name", product_name)
            .input("brand", brand)
            .input("specs_json", specs_json)
            .input("unit_price", unit_price)
            .input("stock_quantity", stock_quantity)
            .input("thumbnail_url", thumbnail_url)
            .input("cat_id", cat_id)

            .query(`
                INSERT INTO Products
                (
                    product_name,
                    brand,
                    specs_json,
                    unit_price,
                    stock_quantity,
                    thumbnail_url,
                    cat_id
                )

                VALUES
                (
                    @product_name,
                    @brand,
                    @specs_json,
                    @unit_price,
                    @stock_quantity,
                    @thumbnail_url,
                    @cat_id
                )
            `);

        res.status(201).json({
            message: "Thêm sản phẩm thành công"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});

// api xóa sản phẩm
routes.delete("/products/:id", async (req, res) => {
     try {

        const { id } = req.params;

        const pool = await connectDB();

        await pool.request()

            .input("id", id)

            .query(`
                DELETE FROM Products
                WHERE product_id = @id
            `);

        res.status(200).json({
            message: "Xoá sản phẩm thành công"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
});

// api cập nhật sản phẩm
routes.put("/products/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const {
                product_name,
                brand,
                specs_json,
                unit_price,
                stock_quantity,
                thumbnail_url,
                cat_id
            } = req.body;
            const pool = await connectDB();
            await pool.request()
                .input("id", id)
                .input("product_name", product_name)
                .input("brand", brand)
                .input("specs_json", specs_json)
                .input("unit_price", unit_price)
                .input("stock_quantity", stock_quantity)
                .input("thumbnail_url", thumbnail_url)
                .input("cat_id", cat_id)
                .query(`
                    UPDATE Products
                    SET
                        product_name = @product_name,
                        brand = @brand,
                        specs_json = @specs_json,
                        unit_price = @unit_price,
                        stock_quantity = @stock_quantity,
                        thumbnail_url = @thumbnail_url,
                        cat_id = @cat_id
                    WHERE product_id = @id
                `);
            res.status(200).json({
                message: "Cập nhật sản phẩm thành công"
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: err.message
            });
        }
    });

export default routes;
