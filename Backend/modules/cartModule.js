import cartDAO from '../daos/cartDAO.js';

class CartModule {
    // [NGHIỆP VỤ 1]: Thêm sản phẩm vào giỏ hàng
    addToCart = async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.user_id; // Lấy an toàn từ token đã qua middleware xác thực

            // 1. Gọi DAO kiểm tra sự tồn tại của sản phẩm trong giỏ
            const checkItem = await cartDAO.checkItemInCart(userId, productId);

            if (checkItem.length > 0) {
                // 2a. Nếu đã có thì lệnh cho DAO cộng dồn số lượng
                await cartDAO.updateQuantity(userId, productId, quantity);
            } else {
                // 2b. Nếu chưa có thì lệnh cho DAO chèn bản ghi mới
                await cartDAO.insertToCart(userId, productId, quantity);
            }

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
}

export default new CartModule();