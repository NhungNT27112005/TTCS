import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import './OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderSummary, setOrderSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderDetailApi(orderId);
        setOrderSummary(response.data.orderSummary);
        setItems(response.data.items || []);
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
        setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã huỷ';
      default: return status || 'Không xác định';
    }
  };

  const translateDeliveryMethod = (method) => {
    switch (method) {
      case 'Fast Shipping': return 'Giao hàng nhanh';
      case 'Economy Shipping': return 'Giao hàng tiết kiệm';
      case 'Express Shipping': return 'Hỏa tốc E-Tech (Trong ngày)';
      default: return method || 'Chưa chọn';
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price_at_sale || item.price || 0), 0);

  if (loading) {
    return <div className="order-detail-page"><div className="order-detail-loading">Đang tải chi tiết đơn hàng...</div></div>;
  }

  if (error || !orderSummary) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-error">
          <p>{error || 'Không tìm thấy đơn hàng.'}</p>
          <button className="btn-back-to-history" onClick={() => navigate('/profile/orders')}>
            Quay lại lịch sử đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <div>
          <h2>Chi tiết đơn hàng</h2>
          <p className="order-detail-id">Mã đơn: <strong>{orderSummary.order_id}</strong></p>
          <p>Ngày đặt: {new Date(orderSummary.created_at).toLocaleString('vi-VN')}</p>
        </div>
        <button className="btn-back-to-history" onClick={() => navigate('/profile/orders')}>
          Trở về lịch sử đơn hàng
        </button>
      </div>

      <div className="order-detail-summary">
        <div>
          <h3>Thông tin đơn hàng</h3>
          <p><strong>Trạng thái:</strong> {translateStatus(orderSummary.order_status)}</p>
          <p><strong>Thanh toán:</strong> {orderSummary.payment_method}</p>
          <p><strong>Vận chuyển:</strong> {translateDeliveryMethod(orderSummary.delivery_method)}</p>
          <p><strong>Địa chỉ nhận:</strong> {orderSummary.delivery_address}</p>
          {orderSummary.note && <p><strong>Ghi chú:</strong> {orderSummary.note}</p>}
        </div>
        <div>
          <h3>Thanh toán</h3>
          <p><strong>Tổng tiền đơn hàng:</strong> {formatCurrency(orderSummary.total_cost)}</p>
        </div>
      </div>

      <div className="order-detail-items">
        <h3>Danh sách sản phẩm</h3>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tạm tính</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.detail_id || `${item.product_id}-${item.quantity}`}>
                <td>{item.product_name || item.product_id}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unit_price_at_sale || item.price)}</td>
                <td>{formatCurrency((item.quantity || 0) * (item.unit_price_at_sale || item.price || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="order-detail-total">
          <span>Tổng cộng:</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
