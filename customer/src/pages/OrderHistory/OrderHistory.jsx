import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import './OrderHistory.css';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const deliveryMethodLabels = {
        'Fast Shipping': 'Giao hàng nhanh',
        'Economy Shipping': 'Giao hàng tiết kiệm',
        'Express Shipping': 'Hỏa tốc E-Tech (Trong ngày)'
    };

    const translateDeliveryMethod = (method) => deliveryMethodLabels[method] || method;

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                // 🎯 ỦY QUYỀN TRUYỀN TIN QUA SERVICE: Gọi hàm lấy lịch sử đơn hàng
                const response = await orderService.getOrderHistoryApi();
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi lấy lịch sử đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderHistory();
    }, []);

    // Hàm đổi màu badge tương ứng với CHECK ràng buộc CK_OrderStatus
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'SHIPPING': return 'status-shipping';
            case 'DELIVERED': return 'status-delivered';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    const translateOrderStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'SHIPPING': return 'Đang giao';
            case 'DELIVERED': return 'Đã giao';
            case 'CANCELLED': return 'Đã huỷ';
            default: return status || 'Không xác định';
        }
    };

    // Hành động của khách hàng: xác nhận đã nhận hàng (COD) hoặc thanh toán (Bank transfer)
    const handleCustomerAction = async (orderId, actionType) => {
        try {
            if (actionType === 'received') {
                await orderService.updateOrderStatusApi(orderId, 'DELIVERED');
            } else if (actionType === 'paid') {
                // For now mark as DELIVERED after payment confirmation from customer side
                await orderService.updateOrderStatusApi(orderId, 'DELIVERED');
            }
            // reload list
            const resp = await orderService.getOrderHistoryApi();
            setOrders(resp.data);
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        }
    };
    const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
        try {
            // 🎯 Gọi đúng hàm đã được định nghĩa trong file orderService của bạn
            await orderService.updateOrderStatusApi(orderId, 'CANCELLED');
            
            alert('Hủy đơn hàng thành công!');
            
            // Tải lại danh sách lịch sử đơn hàng sau khi hủy
            const response = await orderService.getOrderHistoryApi();
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            alert(error.response?.data?.message || 'Không thể hủy đơn hàng vào lúc này.');
        }
    };

    if (loading) return <div className="history-loading">Đang tải lịch sử đơn hàng...</div>;

    return (
        <div className="order-history-box">
            <h2 className="history-title"><i className="fa-solid fa-clock-rotate-left"></i> Lịch sử đặt hàng</h2>
            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.order_id} className="order-history-card">
                            <div className="card-header">
                                <span className="order-id">Mã đơn: <strong>{order.order_id}</strong></span>
                                <span className={`status-badge ${getStatusBadgeClass(order.order_status?.toUpperCase())}`}>
                                    {translateOrderStatus(order.order_status?.toUpperCase())}
                                </span>
                            </div>
                            <div className="card-body">
                                <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                                <p><strong>Địa chỉ nhận:</strong> {order.delivery_address}</p>
                                <p><strong>Vận chuyển:</strong> {translateDeliveryMethod(order.delivery_method)}</p>
                                <p><strong>Thanh toán:</strong> {order.payment_method}</p>
                                {order.note && <p className="order-note-text"><strong>Ghi chú:</strong> <em>"{order.note}"</em></p>}
                            </div>
                            <div className="card-footer">
                                <span>Tổng tiền thanh toán:</span>
                                <span className="total-amount">{order.total_cost?.toLocaleString()}đ</span>
                                <div className="order-actions">
                                    <button className="btn-detail" onClick={() => navigate(`/profile/orders/${order.order_id}`)}>
                                        Xem chi tiết
                                    </button>
                                    {order.order_status === 'PENDING' && (
                                        <button className="btn-cancel-order" onClick={() => handleCancelOrder(order.order_id)}>
                                            Hủy đơn hàng
                                        </button>
                                    )}

                                    {/* Disable actions for cancelled orders */}
                                    {order.order_status !== 'CANCELLED' && (
                                        <>
                                            {order.order_status === 'SHIPPING' && order.payment_method === 'COD' && (
                                                <button className="btn-received" onClick={() => handleCustomerAction(order.order_id, 'received')}>
                                                    Đã nhận được hàng
                                                </button>
                                            )}

                                            {order.order_status === 'SHIPPING' && order.payment_method === 'BANK_TRANSFER' && (
                                                <button className="btn-pay" onClick={() => navigate('/payment', { state: { orderId: order.order_id }})}>
                                                    Thanh toán
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-orders">
                    <i className="fa-solid fa-box-open"></i>
                    <p>Bạn chưa thực hiện đơn hàng nào trên hệ thống E-Tech.</p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;