import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "etech_super_secret_key_2024";

export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy token. Vui lòng đăng nhập!" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => { 
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        }
        
        // Kiểm tra nghiêm ngặt: role_id phải bằng 2 hoặc role là admin mới được đi tiếp
        if (decoded.role !== "admin" && decoded.role_id !== 2) {
            return res.status(403).json({ message: "Từ chối truy cập! Bạn không có quyền quản trị." });
        }
        
        req.user = decoded;
        next();
    });
};