import userDAO from '../daos/userDAO.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

class UserModule {
    // Hàm mã hóa mật khẩu nội bộ
    #hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    // [NGHIỆP VỤ 1]: Đăng nhập 
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const hashedPassword = this.#hashPassword(password); // 🎉 Giờ thì 'this' đã an toàn, chạy vô tư!
            const recordset = await userDAO.findUserByCredentials(email, hashedPassword);

            if (recordset.length === 0) {
                return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
            }

            const user = recordset[0];
            const role = user.role_id === 2 ? "admin" : "customer";
            const payload = { user_id: user.user_id, username: user.username, email: user.email, role };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

            res.status(200).json({ message: "Đăng nhập thành công!", token, user: payload });
        } catch (err) {
            console.error("❌ LỖI TẠI UserModule - login:", err.message);
            res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
        }
    }

    // [NGHIỆP VỤ 2]: Đăng ký 
    // [userModule.js]
register = async (req, res) => {
    try {
        // Lấy đủ 5 tham số từ body
        const { username, email, password, phone_number, default_address } = req.body;

        // Kiểm tra đầu vào
        if (!username || !email || !password || !phone_number || !default_address) {
            return res.status(400).json({ message: "Vui lòng điền đủ thông tin!" });
        }

        // Gọi DAO (đã gộp kiểm tra trùng vào SP)
        const result = await userDAO.createUser({
            newUserId: 'U' + Date.now().toString().slice(-10),
            username,
            email,
            hashedPassword: this.#hashPassword(password),
            defaultRoleId: 1,
            phone: phone_number,
            address: default_address
        });

        // Xử lý phản hồi từ SP
        if (result === 'EXIST_EMAIL') return res.status(400).json({ message: "Email đã tồn tại!" });
        if (result === 'EXIST_PHONE') return res.status(400).json({ message: "Số điện thoại đã tồn tại!" });

        res.status(201).json({ message: "Đăng ký thành công!" });
        } catch (err) {
            res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
        }
    }
    // THÊM MỚI - Lấy thông tin cá nhân
    getProfile = async (req, res) => {
        try {
            // Đồng bộ chuẩn chữ .id
            if (req.user.user_id !== req.params.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Không có quyền truy cập." });
            }

            // Truyền req.params.id xuống DAO
            const recordset = await userDAO.getUserById(req.params.id);

            if (recordset.length > 0) {
                res.json(recordset[0]);
            } else {
                res.status(404).send("Không tìm thấy người dùng");
            }
        } catch (err) {
            res.status(500).send("Lỗi lấy thông tin cá nhân");
        }
    }
    // [NGHIỆP VỤ 4]: Cập nhật thông tin cá nhân
    updateProfile = async (req, res) => {
        try {
            // Kiểm tra quyền: Chỉ chính chủ hoặc Admin mới được sửa
            if (req.user.user_id !== req.params.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Không có quyền chỉnh sửa." });
            }

            const { phone_number, default_address } = req.body;
            if (!phone_number || !default_address) {
                return res.status(400).json({ message: "Số điện thoại và địa chỉ không được để trống!" });
            }

            // Ra lệnh cho DAO thực thi câu lệnh UPDATE dưới DB
            const result = await userDAO.updateUserProfile(req.params.id, phone_number, default_address);

            // 5. Xử lý kết quả trả về từ Stored Procedure
            if (result === 'EXIST_PHONE') {
                return res.status(400).json({ message: "Số điện thoại này đã được tài khoản khác sử dụng!" });
            }

            return res.status(200).json({ message: "Cập nhật hồ sơ thành công!" });
        } catch (err) {
            console.error("❌ LỖI TẠI UserModule - updateProfile:", err.message);
            res.status(500).send("Lỗi khi cập nhật thông tin");
        }
    }
    // --- [ĐỒNG BỘ ADMIN] NGHIỆP VỤ ĐĂNG NHẬP ADMIN ---
    loginAdmin = async (req, res) => {
        try {
            // 1. Lấy dữ liệu do Axios gửi lên từ req.body
            const { email, password } = req.body;

            // 2. Kiểm tra tài khoản trong database
            const user = await userDAO.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
            }

            // 3. Đối chiếu mật khẩu đã băm
            const hashedPassword = this.#hashPassword(password); 
            if (user.password_hash !== hashedPassword) {
                return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
            }
            
            // 4. Kiểm tra quyền hạn Admin
            if (user.role_id !== 2) {
                return res.status(403).json({ message: "Tài khoản không có quyền truy cập quản trị!" });
            }

            // 5. Khởi tạo Token cấp quyền hợp lệ
            const payload = { user_id: user.user_id, username: user.username, email: user.email, role: "admin" };
            const token = jwt.sign(payload, process.env.JWT_SECRET || "etech_super_secret_key_2024", { 
                expiresIn: "7d" 
            });

            // 6. Trả kết quả chuẩn HTTP 200 về cho Axios FrontEnd nhận dữ liệu data
            return res.status(200).json({ 
                message: "Đăng nhập hệ thống quản trị thành công!", 
                token, 
                user: payload 
            });

        } catch (err) {
            console.error("❌ LỖI ĐĂNG NHẬP ADMIN:", err.message);
            return res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập!" });
        }
    }

    listAllUsers = async (req, res) => {
        try {
            // Gọi xuống DAO để lấy dữ liệu thô từ cơ sở dữ liệu
            const users = await userDAO.getAllUsers();
            return res.status(200).json(users);
        } catch (err) {
            console.error("❌ LỖI TẠI UserModule - listAllUsers:", err.message);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách người dùng!" });
        }
    }

    // --- [ĐỒNG BỘ ADMIN] THAY ĐỔI QUYỀN HẠN USER ---
    changeUserRole = async (req, res) => {
        try {
            // Module lo việc bóc tách id từ params và role_id từ body gửi lên
            const { id } = req.params;
            const { role_id } = req.body;

            // Ra lệnh cho DAO cập nhật
            await userDAO.updateUserRole(id, role_id);
            return res.status(200).json({ message: "Đã cập nhật quyền thành công" });
        } catch (err) {
            console.error("❌ LỖI TẠI UserModule - changeUserRole:", err.message);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật quyền: " + err.message });
        }
    }

    // --- [ĐỒNG BỘ ADMIN] KHÓA / MỞ KHÓA TÀI KHOẢN ---
    changeUserStatus = async (req, res) => {
        try {
            // Module lo việc bóc tách id từ params và trạng thái is_active từ body
            const { id } = req.params;
            const { is_active } = req.body;

            // Ra lệnh cho DAO cập nhật trạng thái dưới DB SQL Server
            await userDAO.updateUserStatus(id, is_active);
            return res.status(200).json({ message: "Đã cập nhật trạng thái hoạt động" });
        } catch (err) {
            console.error("❌ LỖI TẠI UserModule - changeUserStatus:", err.message);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái: " + err.message });
        }
    }
}


export default new UserModule();