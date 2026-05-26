// customer/src/services/userService.js
import axios from 'axios';
import api from "../api/axiosInstance";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/user`; // Endpoint mới bọc qua tiền tố /api/user

class UserService {
    // Gọi API xử lý đăng nhập
    async loginApi(email, password) {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
        return response;
    }

    // Gọi API xử lý đăng ký tài khoản mới
    async registerApi(username, email, password, phone, address) {
        const response = await axios.post(`${API_BASE_URL}/register`, { 
            username, 
            email, 
            password, 
            phone_number: phone,      // Bây giờ phone mới được định nghĩa
            default_address: address  // Bây giờ address mới được định nghĩa
        });
        return response;
    }
    // 3.Gọi API lấy thông tin Profile dựa trên userId
    async getProfileApi(userId) {
        // Sử dụng instance 'api' để tự động đính kèm Token trong Header
        const response = await api.get(`${API_BASE_URL}/profile/${userId}`);
        return response;
    }

    // 4.Gọi API cập nhật thông tin Profile (Số điện thoại, địa chỉ)
    async updateProfileApi(userId, editData) {
        // Sử dụng instance 'api' để tự động đính kèm Token trong Header
        const response = await api.put(`${API_BASE_URL}/profile/${userId}`, editData);
        return response;
    }
    async sendOtpEmailApi(email) {
        // Sau này sếp đấu nối Backend thì dùng dòng dưới:
        // return await axios.post(`${API_BASE_URL}/forgot-password`, { email });
        
        // Hiện tại giả lập để sếp chạy UI trơn tru:
        return { status: 200, data: { message: `Mã OTP đã được gửi đến: ${email}` } };
    }

    // 🌟 VIẾT THÊM 2: Gửi mã OTP lên hệ thống để xác thực
    async verifyOtpApi(email, otp) {
        // Sau này sếp đấu nối Backend thực tế:
        // return await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
        
        // Giả lập khớp mã OTP 123456 như logic cũ của sếp
        if (otp === "123456") {
            return { status: 200, data: { success: true } };
        } else {
            throw { response: { data: { message: "Mã OTP không chính xác! Thử lại với 123456" } } };
        }
    }

    // 🌟 VIẾT THÊM 3: Gửi mật khẩu mới để cập nhật vào cơ sở dữ liệu Users
    async resetPasswordApi(email, newPassword) {
        // đấu nối Backend thực tế:
        // return await axios.post(`${API_BASE_URL}/reset-password`, { email, newPassword });
        
        // Giả lập cập nhật thành công:
        return { status: 200, data: { message: "Đổi mật khẩu thành công!" } };
    }
}

export default new UserService();