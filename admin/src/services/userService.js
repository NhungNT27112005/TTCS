import adminApi from '../api/adminApi';

class UserService {
    async getAllUsers() {
        const res = await adminApi.get('/admin/users');
        return res.data;
    }

    async updateUserRole(userId, roleId) {
        return await adminApi.put(`/admin/users/${userId}/role`, { role_id: Number(roleId) });
    }

    async updateUserStatus(userId, isActive) {
        return await adminApi.put(`/admin/users/${userId}/status`, { is_active: isActive });
    }

    async deleteUser(userId) {
        return await adminApi.delete(`/admin/users/${userId}`);
    }
}

export default new UserService();