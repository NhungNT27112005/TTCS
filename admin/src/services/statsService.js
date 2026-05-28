import adminApi from '../api/adminApi';

class StatsService {
    async getDashboardStats() {
        const response = await adminApi.get('/api/admin/stats');
        return response.data;
    }
}
export default new StatsService();