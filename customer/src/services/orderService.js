import api from "../api/axiosInstance"; 

const ORDER_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/orders`;

class OrderService {
    // 1. Gửi yêu cầu thanh toán tạo đơn hàng mới
    async checkoutApi(orderData) {
        return await api.post(`${ORDER_BASE_URL}/checkout`, orderData);
    }

    // 2. Lấy danh sách lịch sử mua hàng của khách
    async getOrderHistoryApi() {
        return await api.get(`${ORDER_BASE_URL}/history`);
    }
    //Hỗ trợ lấy thông tin Profile đổ vào Form của Payment.jsx
    async getUserProfileApi(userId) {
        return await api.get(`/api/user/profile/${userId}`);
    }

    // Khách hàng cập nhật trạng thái đơn (ví dụ: xác nhận đã chuyển khoản)
    async updateOrderStatusApi(orderId, status) {
        return await api.put(`${ORDER_BASE_URL}/${orderId}/status`, { status });
    }

    async getOrderDetailsApi(orderId) {
        return await api.get(`${ORDER_BASE_URL}/${orderId}/details`);
    }
}

export default new OrderService();