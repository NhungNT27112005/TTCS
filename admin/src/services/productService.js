import adminApi from '../api/adminApi'; // Import instance mới

class ProductService {
    async getAllProducts() {
        // Không cần truyền token, nó tự đính kèm ở interceptor
        const res = await adminApi.get('/admin/products/products');
        return res.data;
    }

    async saveProduct(productData, isEdit) {
        const url = `/admin/products${isEdit ? '/' + productData.product_id : ''}`;
        const method = isEdit ? "put" : "post";
        return await adminApi[method](url, productData);
    }

    async deleteProduct(id) {
        return await adminApi.delete(`/admin/products/${id}`);
    }
    async getAllCategories() {
        const res = await adminApi.get('/admin/categories/category');
        return res.data;
    }
    
}
export default new ProductService();