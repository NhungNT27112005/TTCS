import adminApi from '../api/adminApi';

class AuthService {
    async loginAdminApi(email, password) {
        // adminApi đã cấu hình baseURL, sếp chỉ cần điền path
        const response = await adminApi.post('/admin/login', { email, password });
        return response.data;
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}

export default new AuthService();