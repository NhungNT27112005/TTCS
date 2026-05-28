// customer/src/services/userService.js

import api from "../api/axiosInstance";

class UserService {

    // 1. Đăng nhập
    async loginApi(email, password) {

        const response =
            await api.post(
                "/api/user/login",
                {
                    email,
                    password
                }
            );

        return response;
    }

    // 2. Đăng ký
    async registerApi(
        username,
        email,
        password,
        phone,
        address
    ) {

        const response =
            await api.post(
                "/api/user/register",
                {
                    username,
                    email,
                    password,
                    phone_number: phone,
                    default_address: address
                }
            );

        return response;
    }

    // 3. Lấy profile
    async getProfileApi(userId) {

        const response =
            await api.get(
                `/api/user/profile/${userId}`
            );

        return response;
    }

    // 4. Cập nhật profile
    async updateProfileApi(
        userId,
        editData
    ) {

        const response =
            await api.put(
                `/api/user/profile/${userId}`,
                editData
            );

        return response;
    }

    // 5. Gửi OTP
    async sendOtpEmailApi(email) {

        return {
            status: 200,
            data: {
                message:
                    `Mã OTP đã được gửi đến: ${email}`
            }
        };
    }

    // 6. Verify OTP
    async verifyOtpApi(
        email,
        otp
    ) {

        if (otp === "123456") {

            return {
                status: 200,
                data: {
                    success: true
                }
            };

        } else {

            throw {
                response: {
                    data: {
                        message:
                            "Mã OTP không chính xác! Thử lại với 123456"
                    }
                }
            };
        }
    }

    // 7. Reset password
    async resetPasswordApi(
        email,
        newPassword
    ) {

        return {
            status: 200,
            data: {
                message:
                    "Đổi mật khẩu thành công!"
            }
        };
    }
}

export default new UserService();
