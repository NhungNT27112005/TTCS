import cartDAO from '../daos/cartDAO.js';

class CartModule {
    // [NGHIỆP VỤ 1]: Thêm sản phẩm vào giỏ hàng
    addToCart = async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.user_id; 

            // Giờ đây không cần checkItemInCart hay if-else gì ở đây nữa
            // Chỉ gọi duy nhất 1 lần xuống Procedure tích hợp
            await cartDAO.addOrUpdateCart(userId, productId, quantity);

            res.status(200).send("Đã thêm thành công!");
        } catch (err) {
            console.error("❌ LỖI THÊM VÀO GIỎ HÀNG:", err.message);
            res.status(500).send("Lỗi khi thêm vào giỏ hàng: " + err.message);
        }
    }
    // [NGHIỆP VỤ 2]: Lấy danh sách giỏ hàng của người dùng
    getCart = async (req, res) => {
        try {
            // Kiểm tra bảo mật: Chỉ chính chủ hoặc Admin mới được xem giỏ hàng này
            if (req.user.user_id !== req.params.userId && req.user.role !== "admin") {
                return res.status(403).json({ message: "Không có quyền xem giỏ hàng này." });
            }

            // Gọi DAO bốc vác dữ liệu bản ghi từ SQL Server lên
            const recordset = await cartDAO.getCartByUserId(req.params.userId);
            res.json(recordset);
        } catch (err) {
            console.error("❌ LỖI LẤY GIỎ HÀNG:", err.message);
            res.status(500).send("Lỗi lấy giỏ hàng");
        }
    }

    // [NGHIỆP VỤ 3]: Xóa sản phẩm khỏi giỏ hàng
    removeFromCart = async (req, res) => {
        try {
            const userId = req.user.user_id;
            const productId = req.params.productId;

            await cartDAO.removeItemFromCart(userId, productId);
            res.status(200).json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công." });
        } catch (err) {
            console.error("❌ LỖI XÓA SẢN PHẨM GIỎ HÀNG:", err.message);
            res.status(500).send("Lỗi khi xóa sản phẩm khỏi giỏ hàng");
        }
    }
}

export default new CartModule();