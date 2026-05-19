import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from "../services/orderService"; // 🌟 Import Service
import './Admin.css';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const loadOrder = async () => {
        try {
            const data = await orderService.getOrderDetail(id); // 🌟 Gọi từ Service
            if (Array.isArray(data) && data.length > 0) {
                setDetails(data);
                setStatus(data[0].order_status);
            }
        } catch (err) {
            console.error(err);
            setDetails([]);
        }
        setLoading(false);
    };
    useEffect(() => { loadOrder(); }, [id]);

    const handleUpdateStatus = async () => {
        try {
            await orderService.updateOrderStatus(id, status); // 🌟 Gọi từ Service
            await loadOrder();
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            alert('Cập nhật thất bại!');
        }
    };

    
    if (loading) return <div className="admin-card"><h2>Đang tải dữ liệu...</h2></div>;
    if (!details.length) return <div className="admin-card"><h2>Không tìm thấy đơn hàng</h2></div>;

    const order = details[0];
    const totalPrice = details.reduce((sum, item) => sum + item.quantity * item.unit_price_at_sale, 0);

    return (
        <div className="admin-card">
            <div className="order-detail-header">
                <div>
                    <h2>Chi tiết đơn hàng #{id}</h2>
                    <p>Ngày tạo: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <button className="btn-back" onClick={() => navigate('/orders')}>Quay lại</button>
            </div>

            <div className="order-customer-box">
                <h3>Thông tin khách hàng</h3>
                <p><strong>Tên: </strong>{order.username}</p>
                <p><strong>Email: </strong>{order.email}</p>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Ảnh</th><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Bảo hành</th>
                    </tr>
                </thead>
                <tbody>
                    {details.map(item => (
                        <tr key={item.detail_id}>
                            <td><img src={item.thumbnail_url} alt="" className="order-product-img" /></td>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>{Number(item.unit_price_at_sale).toLocaleString()}đ</td>
                            <td>{item.warranty_period_applied} tháng</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="order-detail-footer">
                <div className="order-total-box">
                    <h3>Tổng tiền</h3>
                    <h2>{Number(totalPrice).toLocaleString()}đ</h2>
                </div>
                <div className="order-status-box">
                    <h3>Trạng thái</h3>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="pending">Chờ xử lý</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <button className="btn-save" onClick={handleUpdateStatus}>Cập nhật</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;