import { connectDB } from '../config/db.js';
import sql from 'mssql';

class UserDAO {
    // 1. Tìm kiếm tài khoản dựa trên Email và Mật khẩu đã băm 
    async findUserByCredentials(email, hashedPassword) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("email", sql.VarChar(255), email)
            .input("password", sql.VarChar(255), hashedPassword)
            .execute('sp_VerifyUserCredentials');
        return result.recordset;
    }
    //  Chèn dữ liệu tài khoản mới vào SQL Server
    async createUser(userData) {
    const pool = await connectDB();
        const result = await pool.request()
            .input('userId', sql.VarChar(20), userData.newUserId)
            .input('username', sql.NVarChar(255), userData.username)
            .input('email', sql.VarChar(255), userData.email)
            .input('passwordHash', sql.VarChar(255), userData.hashedPassword)
            .input('roleId', sql.Int, userData.defaultRoleId)
            .input('phone', sql.Char(10), userData.phone)
            .input('address', sql.NVarChar(80), userData.address)
            .execute('sp_RegisterUser'); // Gọi Procedure

        return result.recordset[0].Result;
    }
    // Truy vấn thông tin chi tiết của một User theo ID
    async getUserById(userId) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("userId", sql.VarChar(20), userId)
            .execute('sp_findUserById');
        return result.recordset;
    }

    // Cập nhật số điện thoại và địa chỉ của User dưới DB
    async updateUserProfile(userId, phone, address) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("userId", sql.VarChar(20), userId)
            .input("phone", sql.Char(10), phone)
            .input("address", sql.NVarChar(80), address)
            .execute('sp_updateUserProfile'); // Gọi Procedure
        
        return result.recordset[0].Result;
    }
    //admin
    async findUserByEmail(email) {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input("email", sql.VarChar(255), email)
            .execute('sp_findUserByEmail');
        return result.recordset[0];
    }

    // --- CÁC HÀM QUẢN TRỊ USER CHUẨN HÓA KHỚP SERVER CŨ ---
    async getAllUsers() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT * FROM Users
        `);
        return result.recordset;
    }

    async updateUserRole(id, roleId) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.VarChar(20), id)
            .input('role', sql.Int, roleId)
            .execute('sp_updateUserRole');
    }

    async updateUserStatus(id, isActive) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.VarChar(20), id)
            .input('status', sql.TinyInt, isActive ? 1 : 0) // Đồng bộ kiểu TINYINT 1 hoặc 0
            .execute('sp_updateUserStatus');
    }
}

export default new UserDAO();