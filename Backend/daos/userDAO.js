import { connectDB } from '../config/db.js';
import sql from 'mssql';

class UserDAO {
    // 1. Tìm kiếm tài khoản dựa trên Email và Mật khẩu đã băm (Đã làm ở câu trước)
    async findUserByCredentials(email, hashedPassword) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("email", sql.VarChar(255), email)
            .input("password", sql.VarChar(255), hashedPassword)
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
            .input('email', sql.VarChar(255), email)
            .query("SELECT email FROM dbo.Users WHERE email = @email");
        return result.recordset.length > 0;
    }

    // 3. 🌟 THÊM MỚI: Chèn dữ liệu tài khoản mới vào SQL Server
    async createUser(userData) {
        const pool = await connectDB();
        await pool.request()
            .input('userId', sql.VarChar(20), userData.newUserId)
            .input('username', sql.NVarChar(255), userData.username)
            .input('email', sql.VarChar(255), userData.email)
            .input('passwordHash', sql.VarChar(255), userData.hashedPassword)
            .input('roleId', sql.Int, userData.defaultRoleId)
            .input('phone', sql.Char(10), '')    // Gửi chuỗi rỗng thay vì NULL theo đúng quy tắc DB
            .input('address', sql.NVarChar(80), '')  // Gửi chuỗi rỗng thay vì NULL theo đúng quy tắc DB
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
            .input("userId", sql.VarChar(20), userId)
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
            .input("userId", sql.VarChar(20), userId)
            .input("phone", sql.Char(10), phone)
            .input("address", sql.NVarChar(80), address)
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
            .input("email", sql.VarChar(255), email)
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
            .input('id', sql.VarChar(20), id)
            .input('role', sql.Int, roleId)
            .query("UPDATE Users SET role_id = @role WHERE user_id = @id");
    }

    async updateUserStatus(id, isActive) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.VarChar(20), id)
            .input('status', sql.TinyInt, isActive ? 1 : 0) // Đồng bộ kiểu TINYINT 1 hoặc 0
            .query("UPDATE Users SET is_active = @status WHERE user_id = @id");
    }
}

export default new UserDAO();