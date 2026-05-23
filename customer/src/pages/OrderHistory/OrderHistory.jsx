import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService'; // 🎯 ĐÃ ĐỔI ĐƯỜNG DẪN: Dùng dịch vụ tập trung
import './OrderHistory.css';
import Payment from '../Cart/Payment'; // Nếu có dùng trong Cart.jsx

const OrderHistory = () => {
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
                                <span className={`status-badge ${getStatusBadgeClass(order.order_status)}`}>
                                    {order.order_status}
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