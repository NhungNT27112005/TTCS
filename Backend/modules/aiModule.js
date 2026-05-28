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
            // Lấy userId an toàn từ token đã qua middleware xác thực phía Back-end
            const userId = req.user?.user_id; 

            // 🎯 ĐIỀU KIỆN TRUNG TÂM: Khách vừa đặt hàng xong (checkout thành công), 
            // giỏ hàng hiện tại đã rỗng. Module chủ động đóng gói payload an toàn.
            if (!userId) {
                return res.status(200).json({ 
                    message: 'Không tìm thấy thông tin người dùng, bỏ qua lệnh retrain.' 
                });
            }

            // Gửi request sang dịch vụ Python kèm theo cấu trúc JSON Body tường minh
            // giúp Server AI nhận biết ngữ cảnh giỏ hàng trống mà không bị crash luồng xử lý dữ liệu
            const response = await fetch(`${AI_SERVICE_URL}/retrain`, {
                method: 'POST',
                headers: { 
                    'X-Secret': AI_SECRET,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    userId: userId,
                    cart_status: 'EMPTY_AFTER_CHECKOUT' // Báo hiệu trạng thái rỗng đặc biệt sang Python (Cách 1)
                })
            });

            if (!response.ok) {
                throw new Error(`AI service trả về trạng thái ${response.status}`);
            }

            return res.status(200).json({ message: 'Đã trigger retrain thành công' });

        } catch (err) {
            // 🎯 XỬ LÝ SỰ CỐ TẬP TRUNG: 
            // Nếu Python crash do xử lý logic mảng rỗng ở file .log cũ,
            // Module đứng ra bọc lót, ghi nhận cảnh báo ngầm và trả về 200 để giữ an toàn cho luồng Web.
            console.error('❌ Lỗi tại AiModule - triggerRefreshCart (Đã được Module xử lý an toàn):', err.message);
            
            return res.status(200).json({ 
                message: 'Đơn hàng tạo thành công. Hệ thống gợi ý AI đang đồng bộ ngầm.' 
            });
        }
    }
}

export default new AiModule();