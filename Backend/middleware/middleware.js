// Backend/middleware/middleware.js
import jwt from "jsonwebtoken";

// MIDDLEWARE XÁC THỰC JWT (ĐÃ FIX LỖI 401)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Header phải có dạng: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token. Vui lòng đăng nhập." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ LỖI XÁC THỰC TOKEN:", err.message);
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
    req.user = decoded; // Gắn thông tin user vào request
    next();
  });
};