import orderDAO from '../daos/orderDAO.js';
import { connectDB } from '../config/db.js';
import sql from 'mssql';

class OrderModule {
    // Xử lý nghiệp vụ Đặt hàng & Thanh toán đơn hàng
    checkout = async (req, res) => {
        const customerId = req.user.user_id;
        const { delivery_address, payment_method, delivery_method } = req.body;

        if (!delivery_address || !payment_method || !delivery_method) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
        }

        try {
            const newOrderId = 'OD' + Date.now().toString().slice(-10);
            
            // Gọi thẳng checkout, mặc định chỉ xử lý giỏ hàng
            const result = await orderDAO.checkout(
                { customerId }, 
                { newOrderId, delivery_address, payment_method, delivery_method }
            );

            if (result.success) {
                res.status(201).json({ message: result.message, order_id: newOrderId });
            } else {
                res.status(400).json({ message: result.message });
            }
        } catch (err) {
            res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
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
            const details = await orderDAO.getOrderDetailsById(id);
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

            const details = await orderDAO.getOrderDetailsById(id);
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

            if (status === 'CANCELLED') {
                // Chặn nghiêm ngặt: Chỉ cho phép hủy khi trạng thái cũ là PENDING
                if (order.order_status !== 'PENDING') {
                    return res.status(400).json({ message: 'Không thể hủy đơn hàng khi đơn đã được xử lý hoặc đang vận chuyển.' });
                }
                
                // Tiến hành cập nhật trạng thái đơn thành CANCELLED
                await orderDAO.updateOrderStatus(id, 'CANCELLED');
                return res.json({ message: 'Đơn hàng của bạn đã được hủy thành công.' });
            }

            // Hỗ trợ các luồng hợp lệ từ phía khách hàng:
            // 1) Khách xác nhận chuyển khoản cho đơn BANK_TRANSFER: từ PENDING -> SHIPPING
            // 2) Khách xác nhận đã nhận hàng (cho COD hoặc sau thanh toán): từ SHIPPING -> DELIVERED

            if (status === 'SHIPPING') {
                if (order.order_status !== 'PENDING') {
                    return res.status(400).json({ message: 'Chỉ có đơn PENDING mới có thể chuyển sang SHIPPING bởi khách hàng' });
                }
                if (order.payment_method !== 'BANK_TRANSFER') {
                    return res.status(400).json({ message: 'Chỉ đơn chuyển khoản mới yêu cầu khách hàng xác nhận thanh toán.' });
                }
                await orderDAO.updateOrderStatus(id, 'SHIPPING');
                return res.json({ message: 'Xác nhận thanh toán đã được ghi nhận, đơn chuyển sang SHIPPING' });
            }

            if (status === 'DELIVERED') {
                if (order.order_status !== 'SHIPPING') {
                    return res.status(400).json({ message: 'Chỉ có đơn SHIPPING mới có thể xác nhận đã nhận hàng.' });
                }
                await orderDAO.updateOrderStatus(id, 'DELIVERED');
                return res.json({ message: 'Cảm ơn! Đơn hàng đã đánh dấu là DELIVERED.' });
            }

            return res.status(400).json({ message: 'Hành động không hợp lệ từ phía khách hàng.' });
        } catch (err) {
            console.error('Lỗi customerUpdateOrderStatus:', err.message);
            res.status(500).json({ message: err.message });
        }
    }
}
export default new OrderModule();