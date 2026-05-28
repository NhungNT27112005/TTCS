import adminApi from '../api/adminApi';

class UserService {
    async getAllUsers() {
        const res = await adminApi.get('api/admin/users');
        return res.data;
    }
// cập nhật role
    async updateUserRole(userId, roleId) {
        return await adminApi.put(`/api/admin/users/${userId}/role`, { role_id: Number(roleId) });
    }
// cập nhật trạng thái kích hoạt
    async updateUserStatus(userId, isActive) {
        return await adminApi.put(`/api/admin/users/${userId}/status`, { is_active: isActive });
    }
}

export default new UserService();