import adminApi from '../api/adminApi';

class OrderService {
    async getAllOrders() {
        const res = await adminApi.get('/api/admin/orders');
        return res.data;
    }

    async getOrderDetail(id) {
        const res = await adminApi.get(`/api/admin/orders/${id}`);
        return res.data;
    }

    async updateOrderStatus(id, status) {
        const res = await adminApi.put(`/api/admin/orders/${id}`, { status });
        return res.data;
    }
}

export default new OrderService();