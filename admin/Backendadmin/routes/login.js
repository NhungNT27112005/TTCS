import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { connectDB } from "../db.js";  
const routes = express.Router();
routes.use(express.json());
routes.use(cors());
routes.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        const pool = await connectDB();

        const result = await pool.request()

            .input('email', email)
            .input('password', password)

            .query(`
                SELECT user_id,
                       username,
                       email,
                       role_id
                FROM dbo.Users
                WHERE email = @email
                AND password_hash = @password
            `);

        // không tìm thấy
        if (result.recordset.length === 0) {

            return res.status(401).json({
                message: "Email hoặc mật khẩu không đúng!"
            });
        }

        const user = result.recordset[0];

        // chỉ cho admin login
        if (user.role_id !== 1) {

            return res.status(403).json({
                message: "Bạn không có quyền quản trị!"
            });
        }

        // login thành công
        res.status(200).json({

            message: "Đăng nhập thành công!",

            user: {

                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role_id: user.role_id
            }
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Lỗi hệ thống: " + err.message
        });
    }
});
export default routes;