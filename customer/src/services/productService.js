// customer/src/services/productService.js
import axios from 'axios';
import api from "../api/axiosInstance"; // Dùng instance này cho các API cần Token (như add to cart)

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/products`;
const CART_URL = `${process.env.REACT_APP_API_BASE_URL}/api/cart`;

class ProductService {
    // 1. Lấy toàn bộ sản phẩm hiển thị ở trang chủ
    async getAllProductsApi() {
        return await axios.get(`${BASE_URL}`);
    }

    // 2. Lấy chi tiết một sản phẩm dựa trên ID
    async getProductDetailApi(productId) {
        return await axios.get(`${BASE_URL}/${productId}`);
    }

    // 3. Lấy sản phẩm lọc theo danh mục (catId)
    async getProductsByCategoryApi(catId) {
        return await axios.get(`${BASE_URL}/category/${catId}`);
    }

    // 4. Tìm kiếm sản phẩm theo từ khóa (query)
    async searchProductsApi(query) {
        return await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    }

    // 5. Thêm sản phẩm vào giỏ hàng (Gọi an toàn qua trục api để tự đính token)
    async addToCartApi(productId, quantity) {
        return await api.post(`${CART_URL}/add`, { productId, quantity });
    }
}

export default new ProductService();