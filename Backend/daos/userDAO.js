import { connectDB } from '../config/db.js';

class UserDAO {
    // 1. Tìm kiếm tài khoản dựa trên Email và Mật khẩu đã băm (Đã làm ở câu trước)
    async findUserByCredentials(email, hashedPassword) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("email", email)
            .input("password", hashedPassword)
            .query(`
                SELECT user_id, username, email, role_id
                FROM dbo.Users
                WHERE email = @email AND password_hash = @password
            `);
        return result.recordset;
    }

    // 2. 🌟 THÊM MỚI: Kiểm tra email đã tồn tại trong hệ thống chưa
    async checkEmailExists(email) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('email', email)
            .query("SELECT email FROM dbo.Users WHERE email = @email");
        return result.recordset.length > 0;
    }

    // 3. 🌟 THÊM MỚI: Chèn dữ liệu tài khoản mới vào SQL Server
    async createUser(userData) {
        const pool = await connectDB();
        await pool.request()
            .input('userId', userData.newUserId)
            .input('username', userData.username)
            .input('email', userData.email)
            .input('passwordHash', userData.hashedPassword)
            .input('roleId', userData.defaultRoleId)
            .input('phone', '')    // Gửi chuỗi rỗng thay vì NULL theo đúng quy tắc DB
            .input('address', '')  // Gửi chuỗi rỗng thay vì NULL theo đúng quy tắc DB
            .query(`
                INSERT INTO dbo.Users (
                    user_id,
                    username,
                    email,
                    password_hash,
                    role_id,
                    phone_number,
                    default_address,
                    is_active
                )
                VALUES (
                    @userId,
                    @username,
                    @email,
                    @passwordHash,
                    @roleId,
                    @phone,
                    @address,
                    1
                )
            `);
    }
    // Truy vấn thông tin chi tiết của một User theo ID
    async getUserById(userId) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("userId", userId)
            .query(`
                SELECT user_id, username, email, phone_number, default_address, role_id
                FROM dbo.Users
                WHERE user_id = @userId
            `);
        return result.recordset;
    }

    // Cập nhật số điện thoại và địa chỉ của User dưới DB
    async updateUserProfile(userId, phone, address) {
        const pool = await connectDB();
        await pool
            .request()
            .input("userId", userId)
            .input("phone", phone)
            .input("address", address)
            .query(`
                UPDATE dbo.Users
                SET phone_number = @phone, default_address = @address
                WHERE user_id = @userId
            `);
    }
    //admin
    async findUserByEmail(email) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("email", email)
            .query(`
                SELECT user_id, username, email, password_hash, role_id 
                FROM Users 
                WHERE email = @email
            `);
        return result.recordset[0];
    }

    // --- CÁC HÀM QUẢN TRỊ USER CHUẨN HÓA KHỚP SERVER CŨ ---
    async getAllUsers() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT user_id, username, email, phone_number, role_id, is_active FROM Users
        `);
        return result.recordset;
    }

    async updateUserRole(id, roleId) {
        const pool = await connectDB();
        await pool.request()
            .input('id', id)
            .input('role', roleId)
            .query("UPDATE Users SET role_id = @role WHERE user_id = @id");
    }

    async updateUserStatus(id, isActive) {
        const pool = await connectDB();
        await pool.request()
            .input('id', id)
            .input('status', isActive ? 1 : 0) // Đồng bộ kiểu BIT/INT 1 hoặc 0
            .query("UPDATE Users SET is_active = @status WHERE user_id = @id");
    }
}

export default new UserDAO();