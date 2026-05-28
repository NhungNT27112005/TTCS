import aiDAO from '../daos/aiDAO.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const AI_SECRET      = process.env.AI_SECRET;

class AiModule {
    // 1. Xử lý lấy sản phẩm tương tự
    async getSimilarProducts(req, res) {
        try {
            const { productId } = req.params;
            const limit = parseInt(req.query.limit) || 5;

            const data = await aiDAO.getSimilarProductsRaw(productId, limit);
            res.status(200).json(data);
        } catch (err) {
            console.error("❌ Lỗi tại AiModule - getSimilarProducts:", err.message);
            res.status(500).json({ error: "Lỗi hệ thống dịch vụ gợi ý: " + err.message });
        }
    }

    // 2. Xử lý lấy gợi ý cá nhân hóa
    async getPersonalized(req, res) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 10;

            const data = await aiDAO.getPersonalizedRecommendationsRaw(userId, limit);
            res.status(200).json(data);
        } catch (err) {
            console.error("❌ Lỗi tại AiModule - getPersonalized:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    // 3. Xử lý gợi ý nâng cao từ giỏ hàng hiện hữu
    async getPersonalizedFromCart(req, res) {
        try {
            const { productIds } = req.body;
            if (!productIds || productIds.length === 0) {
                return res.status(200).json([]);
            }

            const data = await aiDAO.getPersonalizedFromCartRaw(productIds);
            res.status(200).json(data);
        } catch (err) {
            console.error("❌ Lỗi tại AiModule - getPersonalizedFromCart:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    // 4. Gọi Python retrain ngầm khi giỏ hàng biến động
    async triggerRefreshCart(req, res) {
        try {
            const response = await fetch(`${AI_SERVICE_URL}/retrain`, {
                method: 'POST',
                headers: { 'X-Secret': AI_SECRET }
            });
            if (!response.ok) throw new Error(`AI service trả về trạng thái ${response.status}`);
            res.status(200).json({ message: 'Đã trigger retrain thành công' });
        } catch (err) {
            console.error('❌ Lỗi tại AiModule - triggerRefreshCart:', err.message);
            res.status(200).json({ message: 'Retrain đang được xử lý ngầm' });
        }
    }
}

export default new AiModule();