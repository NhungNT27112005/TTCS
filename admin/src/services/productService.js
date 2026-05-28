import adminApi from '../api/adminApi'; // Import instance mới

class ProductService {
    async getAllProducts() {
        // Không cần truyền token, nó tự đính kèm ở interceptor
        const res = await adminApi.get('/api/admin/products');
        return res.data;
    }

    async saveProduct(productData, isEdit) {
        const url = `/api/admin/products${isEdit ? '/' + productData.product_id : ''}`;
        const method = isEdit ? "put" : "post";
        return await adminApi[method](url, productData);
    }

    async deleteProduct(id) {
        return await adminApi.delete(`/api/admin/products/${id}`);
    }
    async getAllCategories() {
        const res = await adminApi.get('/api/admin/products/categories');
        return res.data;
    }
    
}
export default new ProductService();