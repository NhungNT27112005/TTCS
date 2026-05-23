// customer/src/services/cartService.js
import api from "../api/axiosInstance";

const CART_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/cart`;
const AI_BASE_URL   = `${process.env.REACT_APP_API_BASE_URL}/api/ai`;

class CartService {
    // ==========================================
    // 🛒 CÁC API THAO TÁC GIỎ HÀNG THUẦN TÚY
    // ==========================================

    // Lấy danh sách sản phẩm trong giỏ hàng
    async getCartApi(userId) {
        return await api.get(`${CART_BASE_URL}/${userId}`);
    }

    // Thêm hoặc tăng giảm số lượng sản phẩm trong giỏ
    async addToCartApi(productId, quantity) {
        return await api.post(`${CART_BASE_URL}/add`, { productId, quantity });
    }

    async removeFromCartApi(productId) {
        return await api.delete(`${CART_BASE_URL}/remove/${productId}`);
    }

    // ==========================================
    // ✨ CÁC API PHỤC VỤ GỢI Ý THÔNG MINH (AI)
    // ==========================================

    // Trường hợp 1: Xem chi tiết sản phẩm -> Lấy danh sách sản phẩm tương tự
    async getSimilarProductsApi(productId) {
        return await api.get(`${AI_BASE_URL}/similar-products/${productId}`);
    }

    // Trường hợp 2a: Khách vãng lai chưa đăng nhập -> Lấy gợi ý hành vi cá nhân hóa mặc định
    async getPersonalizedGuestApi(userId) {
        return await api.get(`${AI_BASE_URL}/personalized/${userId}`);
    }

    // Trường hợp 2b: Giỏ hàng trống nhưng đã đăng nhập -> Lấy gợi ý cá nhân hóa có token
    async getPersonalizedMemberApi(userId) {
        return await api.get(`${AI_BASE_URL}/personalized/${userId}`);
    }

    // Trường hợp 2c: Giỏ hàng có sản phẩm -> Gợi ý chuyên sâu dựa trên giỏ hàng vật lý
    async getPersonalizedFromCartApi(userId, productIds) {
        return await api.post(`${AI_BASE_URL}/personalized-from-cart`, { userId, productIds });
    }
}

export default new CartService();