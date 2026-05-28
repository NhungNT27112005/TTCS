import express from 'express';
import userModule from '../modules/userModule.js';
import { authenticateToken } from '../middleware/middleware.js';
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import statsModule from '../modules/statsModule.js';


const router = express.Router();

// CUSTOMER 
router.post('/login', userModule.login);
router.post('/register', userModule.register); 

router.get('/profile/:id', authenticateToken, userModule.getProfile);
router.put('/profile/:id', authenticateToken, userModule.updateProfile);

// --- [ĐỒNG BỘ ADMIN] API LOGIN ADMIN CỦA ADMIN SERVER ---
// Endpoint Đăng nhập của Admin (Sau khi đi qua server sẽ là: POST /admin/login-admin)
router.post("/login-admin", userModule.loginAdmin);

// Lấy danh sách toàn bộ User (GET /admin/users)
router.get("/", verifyAdmin, userModule.listAllUsers);

// Thay đổi quyền hạn (PUT /admin/users/:id/role)
router.put("/:id/role", verifyAdmin, userModule.changeUserRole);

// Khóa/Mở khóa tài khoản (PUT /admin/users/:id/status)
router.put("/:id/status", verifyAdmin, userModule.changeUserStatus);


export default router;