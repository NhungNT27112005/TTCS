import { connectDB } from '../config/db.js';

class AiDAO {
    // 1. Lấy sản phẩm tương tự dựa trên item_similarity
    async getSimilarProductsRaw(productId, limit) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("productId", productId)
            .input("limit", limit)
            .query(`
                SELECT 
                    a.suggested_product_id AS product_id,
                    a.score,
                    p.product_name,
                    p.unit_price,
                    p.thumbnail_url AS image_url
                FROM dbo.ai_train_data a
                JOIN dbo.Products p ON a.suggested_product_id = p.product_id
                WHERE a.product_id = @productId 
                  AND a.type = 'item_similarity'
                ORDER BY a.score DESC
                OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
            `);
        return result.recordset || [];
    }

    // 2. Lấy gợi ý cá nhân hóa (Mặc định khi giỏ trống)
    async getPersonalizedRecommendationsRaw(userId, limit) {
        const pool = await connectDB();
        const result = await pool.request()
            .input("userId", userId)
            .input("limit", limit)
            .query(`
                SELECT TOP (@limit)
                    a.suggested_product_id AS product_id,
                    a.score,
                    p.product_name,
                    p.unit_price,
                    p.thumbnail_url AS image_url
                FROM dbo.ai_train_data a
                JOIN dbo.Products p ON a.suggested_product_id = p.product_id
                WHERE (a.user_id = @userId AND a.type = 'priority_cart')
                   OR a.type = 'item_similarity'
                ORDER BY a.score DESC
            `);
        return result.recordset || [];
    }

    // 3. Lấy gợi ý tổng hợp từ mảng ID sản phẩm có sẵn trong giỏ hàng
    async getPersonalizedFromCartRaw(productIds) {
        const pool = await connectDB();
        const placeholders = productIds.map((_, i) => `@pid${i}`).join(',');
        const request = pool.request();
        productIds.forEach((id, i) => request.input(`pid${i}`, id));

        const result = await request.query(`
            SELECT
                a.suggested_product_id AS product_id,
                SUM(a.score)           AS total_score,
                p.product_name,
                p.unit_price,
                p.thumbnail_url        AS image_url
            FROM dbo.ai_train_data a
            JOIN dbo.Products p ON a.suggested_product_id = p.product_id
            WHERE a.product_id          IN (${placeholders})
              AND a.type                 = 'item_similarity'
              AND a.suggested_product_id NOT IN (${placeholders})
            GROUP BY
                a.suggested_product_id, p.product_name, p.unit_price, p.thumbnail_url
            ORDER BY total_score DESC
            OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
        `);
        return result.recordset || [];
    }
}

export default new AiDAO();