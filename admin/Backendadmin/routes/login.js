import express from "express";
import cors from "cors";
import crypto from "crypto";
import { connectDB } from "../db.js";

const routes = express.Router();

routes.use(express.json());
routes.use(cors());

routes.post("/", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Vui lòng nhập email và mật khẩu!"
            });
        }

        // HASH PASSWORD
        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const pool = await connectDB();

        const result =
            await pool.request()
            .input("email", email)
            .query(`
                SELECT
                    user_id,
                    username,
                    email,
                    role_id,
                    password_hash
                FROM Users
                WHERE email = @email
            `);

        if (
            result.recordset.length
            === 0
        ) {
            return res.status(401)
                .json({
                    message:
                    "Email không tồn tại!"
                });
        }

        const user =
            result.recordset[0];

        // check password
        if (
            user.password_hash !==
            hashedPassword
        ) {
            return res.status(401)
                .json({
                    message:
                    "Mật khẩu không đúng!"
                });
        }

        // admin = 2
        if (user.role_id !== 2) {
            return res.status(403)
                .json({
                    message:
                    "Bạn không có quyền quản trị!"
                });
        }

        return res.status(200)
            .json({
                success: true,
                message:
                    "Đăng nhập thành công!",
                user
            });

    } catch (err) {

        console.log(err);

        return res.status(500)
            .json({
                message:
                    err.message
            });
    }
});

export default routes;