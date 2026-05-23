import orderDAO from '../daos/orderDAO.js';
import { connectDB } from '../config/db.js';
import sql from 'mssql';

class OrderModule {
    // Xử lý nghiệp vụ Đặt hàng & Thanh toán đơn hàng
    checkout = async (req, res) => {
        const customerId = req.user.user_id; // Lấy an toàn từ Token đã qua trạm gác Middleware
        const { delivery_address, payment_method, delivery_method, note } = req.body;

        // Kiểm tra các tham số bắt buộc nhập từ phía giao diện Frontend
        if (!delivery_address || !payment_method || !delivery_method) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ địa chỉ, phương thức thanh toán và vận chuyển!" });
        }

        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);

        try {
            // 1. Gọi DAO lấy danh sách giỏ hàng kèm dữ liệu đối chiếu kho
            const cartItems = await orderDAO.getCartItemsWithStock(customerId);
            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ message: "Giỏ hàng trống rỗng, không thể đặt hàng!" });
            }

            // 2. Kiểm tra tồn kho thực tế của từng món hàng
            for (const item of cartItems) {
                if (item.quantity > item.stock_quantity) {
                    return res.status(400).json({ 
                        message: `Sản phẩm ID #${item.product_id} không đủ số lượng trong kho (Còn: ${item.stock_quantity})` 
                    });
                }
            }

            // 3. Tính toán tổng chi phí hóa đơn bằng hàm giảm mảng
            const totalCost = cartItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            // KÍCH HOẠT VÒNG ĐỜI TRANSACTION
            await transaction.begin();

            // 4. Sinh mã đơn hàng công nghệ
            const newOrderId = 'OD' + Date.now().toString().slice(-10);

            // 5. Chèn thông tin chung của hóa đơn xuống DB thông qua DAO
            await orderDAO.insertOrder(transaction, {
                newOrderId,
                customerId,
                delivery_address,
                totalCost,
                payment_method,
                delivery_method,
                note
            });

            // 6. Chèn chi tiết từng món hàng và khấu trừ tồn kho tương ứng
            for (const item of cartItems) {
                // Chèn chi tiết hóa đơn
                await orderDAO.insertOrderDetail(transaction, newOrderId, item);
                // Trừ kho hàng vật lý
                await orderDAO.decreaseProductStock(transaction, item.product_id, item.quantity);
            }

            // 7. Dọn sạch giỏ hàng vật lý sau khi đóng gói đơn hàng thành công
            await orderDAO.clearCart(transaction, customerId);

            // HOÀN TẤT GIAO DỊCH, GHI DỮ LIỆU ĐỒNG BỘ XUỐNG SQL SERVER
            await transaction.commit();
            res.status(201).json({ message: "Đặt hàng thành công!", order_id: newOrderId });

        } catch (err) {
            // Cơ chế phòng vệ: Nếu bất kỳ bước nào trong Transaction bị sập, thực hiện hoàn nguyên (Rollback) dữ liệu sạch
            if (transaction._begun) await transaction.rollback();
            console.error("❌ LỖI TẠO ĐƠN HÀNG TẠI OrderModule:", err.message);
            res.status(500).json({ message: "Lỗi tạo đơn hàng: " + err.message });
        }
    }
    // [NGHIỆP VỤ MỚI]: 🌟 Lấy lịch sử đơn hàng của người dùng
    getOrderHistory = async (req, res) => {
        try {
            const customerId = req.user.user_id; // Lấy an toàn từ token giải mã
            const history = await orderDAO.getOrderHistory(customerId);
            res.json(history);
        } catch (err) {
            console.error("❌ LỖI LẤY LỊCH SỬ ĐƠN HÀNG:", err.message);
            res.status(500).json({ message: "Lỗi lấy lịch sử đơn hàng: " + err.message });
        }
    }
    //admin
    // --- [GHÉP THÊM] ADMIN --

    // Lấy danh sách
    adminListOrders = async (req, res) => {
        try {
            const orders = await orderDAO.adminGetAllOrders();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // Lấy chi tiết
    adminGetOrderDetail = async (req, res) => {
        try {
            const { id } = req.params;
            const details = await orderDAO.adminGetOrderDetailsById(id);
            res.json(details);
        } catch (err) {
            console.error("❌ LỖI TRONG MODULE:", err.message); 
            res.status(500).json({ message: err.message });
        }
    }

    // Cập nhật trạng thái
    adminUpdateOrderStatus = async (req, res) => {
        try {
            const { status } = req.body;
            await orderDAO.updateOrderStatus(req.params.id, status);
            res.json({ message: "Cập nhật trạng thái thành công" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // Khách hàng lấy chi tiết đơn hàng của chính mình
    getOrderDetailsForCustomer = async (req, res) => {
        try {
            const { id } = req.params;
            const order = await orderDAO.getOrderById(id);
            if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            if (order.customer_id !== req.user.user_id) return res.status(403).json({ message: 'Không có quyền truy cập' });

            const details = await orderDAO.adminGetOrderDetailsById(id);
            res.json({ orderSummary: order, items: details });
        } catch (err) {
            console.error('Lỗi getOrderDetailsForCustomer:', err.message);
            res.status(500).json({ message: err.message });
        }
    }

    // Khách hàng xác nhận đã chuyển khoản: cho phép chuyển trạng thái PENDING -> SHIPPING
    customerUpdateOrderStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Lấy đơn hàng để kiểm tra quyền sở hữu
            const order = await orderDAO.getOrderById(id);
            if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

            // Chỉ chủ sở hữu mới được xác nhận
            if (order.customer_id !== req.user.user_id) {
                return res.status(403).json({ message: "Bạn không có quyền cập nhật đơn hàng này" });
            }

            // Chỉ cho phép chuyển từ PENDING sang SHIPPING khi khách xác nhận chuyển khoản
            if (order.order_status !== 'PENDING') {
                return res.status(400).json({ message: 'Chỉ có đơn ở trạng thái PENDING mới được xác nhận' });
            }

            // Cập nhật trạng thái
            await orderDAO.updateOrderStatus(id, status);
            res.json({ message: 'Cập nhật trạng thái thành công' });
        } catch (err) {
            console.error('Lỗi customerUpdateOrderStatus:', err.message);
            res.status(500).json({ message: err.message });
        }
    }
}
export default new OrderModule();