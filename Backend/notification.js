import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

const app = express();
app.use(express.json());
app.use(cors());


// api để lấy thpong báo hệ thống cho người dùng (ví dụ: khuyến mãi chung)
app.get("/system-notifications", async (req, res) => {
    try {
        const db = await connectDB();
        const notificationsCollection = db.collection("system_notifications");
        const notifications = await notificationsCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        res.json(notifications);
    }
    catch (error) {
        console.error("Lỗi khi lấy thông báo hệ thống:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});