import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService'; // 🎯 ĐÃ ĐỔI ĐƯỜNG DẪN: Dùng dịch vụ tập trung
import './Payment.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const deliveryMethodLabels = {
        'Fast Shipping': 'Giao hàng nhanh',
        'Economy Shipping': 'Giao hàng tiết kiệm',
        'Express Shipping': 'Hỏa tốc E-Tech (Trong ngày)'
    };

    const translateDeliveryMethod = (method) => deliveryMethodLabels[method] || method;

    // Lấy dữ liệu từ Cart truyền sang
    const totalPrice = location.state?.total || 0;
    const selectedItems = location.state?.items || [];
    const orderInfo = location.state?.orderInfo || {
        delivery_address: '',
        payment_method: 'COD',
        delivery_method: 'Fast Shipping',
        note: ''
    };

    const [loading, setLoading] = useState(false);
    const [orderStep, setOrderStep] = useState(1); // 1: Xem thông tin, 2: Hoàn tất đơn hàng
    const [createdOrderId, setCreatedOrderId] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) return;

                const userData = JSON.parse(storedUser);
                
                // 🎯 ỦY QUYỀN LẤY PROFILE QUA HÀM MỚI VIẾT THÊM CỦA SERVICE (/api/user/profile/:id)
                const response = await orderService.getUserProfileApi(userData.user_id);
                const profileData = response.data;

                setFormData({
                    fullName: profileData.username || '',
                    email: profileData.email || '',
                    phone: profileData.phone_number || ''
                });
            } catch (error) {
                console.error("Lỗi tự động lấy thông tin profile:", error);
            }
        };
        fetchUserProfile();
    }, []);

    // HÀM GỌI API ĐẨY ĐƠN HÀNG XUỐNG DATABASE SQL SERVER
    const handleConfirmOrder = async () => {
        try {
            setLoading(true);
            
            const response = await orderService.checkoutApi(orderInfo);

            if (response.status === 201) {
                setCreatedOrderId(response.data.order_id);
                setOrderStep(2); // Chuyển sang bước Hoàn tất hiển thị giao diện thành công
            }
        } catch (error) {
            console.error("Lỗi tạo đơn hàng:", error);
            alert("Xử lý đơn hàng thất bại: " + (error.response?.data?.message || "Vui lòng thử lại!"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container">
            <h1 className="payment-title">XÁC NHẬN THANH TOÁN ĐƠN HÀNG</h1>

            {/* Cấu trúc thanh Stepper tiến trình */}
            <div className="stepper">
                <div className={`step ${orderStep === 1 ? 'active' : ''}`}>
                    <div className="step-icon"><i className="fa-solid fa-file-invoice"></i></div>
                    <p>Thông tin thanh toán</p>
                </div>
                <div className="step-line"></div>
                <div className={`step ${orderStep === 2 ? 'active' : ''}`}>
                    <div className="step-icon"><i className="fa-solid fa-trophy"></i></div>
                    <p>Hoàn tất đơn hàng</p>
                </div>
            </div>

            <div className="payment-content">
                {/* CỘT TRÁI: HIỂN THỊ THEO PHƯƠNG THỨC THANH TOÁN HOẶC TRẠNG THÁI HOÀN TẤT */}
                <div className="payment-left">
                    {orderStep === 1 ? (
                        <>
                            {/* TRƯỜNG HỢP 1: KHÁCH CHỌN CHUYỂN KHOẢN NGÂN HÀNG HOẶC VÍ ĐIỆN TỬ */}
                            {(orderInfo.payment_method === 'BANK_TRANSFER' || orderInfo.payment_method === 'E_WALLET') ? (
                                <div className="qr-display-section">
                                    <h3>Thanh toán trực tuyến bằng mã QR</h3>
                                    <div className="qr-card">
                                        <p className="qr-guide">Vui lòng quét mã QR dưới đây để thực hiện chuyển khoản an toàn</p>
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=E_TECH_PAYMENT_TOTAL_${totalPrice}`} 
                                            alt="QR Code"
                                            className="qr-image" 
                                        />
                                        <div className="bank-details">
                                            <p><strong>Ngân hàng:</strong> MB Bank (Ngân hàng Quân Đội)</p>
                                            <p><strong>Chủ tài khoản:</strong> CÔNG TY CÔNG NGHỆ E-TECH</p>
                                            <p><strong>Số tiền:</strong> <span className="highlight">{totalPrice.toLocaleString()} đ</span></p>
                                            <p><strong>Nội dung CK:</strong> <span className="highlight">ETECH {formData.phone || 'PAY'}</span></p>
                                        </div>
                                    </div>
                                    <button className="btn-confirm-payment" onClick={handleConfirmOrder} disabled={loading}>
                                        {loading ? "Đang xử lý hệ thống..." : "Tôi đã chuyển khoản thành công"}
                                    </button>
                                </div>
                            ) : (
                                /* TRƯỜNG HỢP 2: KHÁCH CHỌN PHƯƠNG THỨC THANH TOÁN COD */
                                <div className="cod-info-section">
                                    <h3><i className="fa-solid fa-truck-ramp-box"></i> Thanh toán khi nhận hàng (COD)</h3>
                                    <div className="cod-card">
                                        <p>Sếp đã lựa chọn hình thức thanh toán khi nhận hàng.</p>
                                        <div className="cod-alert-box">
                                            <i className="fa-solid fa-circle-info"></i>
                                            <span><strong>Thông báo nghiệp vụ hệ thống:</strong> Đơn hàng sau khi khởi tạo sẽ nằm ở trạng thái <mark className="badge-pending">PENDING</mark> (Chờ duyệt) và <mark className="badge-shipping">SHIPPING</mark> (Đang giao). Khi đối tác vận chuyển giao hàng thành công và Admin chuyển trạng thái sang <mark className="badge-completed">DELIVERED / COMPLETED</mark>, đơn hàng sẽ chính thức được hệ thống ghi nhận là Đã trả tiền vĩnh viễn!</span>
                                        </div>
                                    </div>
                                    <button className="btn-confirm-payment" onClick={handleConfirmOrder} disabled={loading}>
                                        {loading ? "Đang tạo đơn..." : "Xác nhận tạo đơn hàng COD"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* BƯỚC ĐẶT HÀNG THÀNH CÔNG MIÊN VIỄN */
                        <div className="order-success-section">
                            <div className="success-icon-box"><i className="fa-solid fa-circle-check"></i></div>
                            <h2>ĐẶT HÀNG THÀNH CÔNG VANG DỘI!</h2>
                            <p className="success-msg">Hệ thống lõi E-Tech đã ghi nhận đơn hàng thành công .</p>
                            <div className="success-details-card">
                                <p><strong>Mã đơn hàng (Order ID):</strong> <span className="text-blue">{createdOrderId}</span></p>
                                <p><strong>Khách hàng:</strong> {formData.fullName}</p>
                                <p><strong>Địa chỉ giao nhận:</strong> {orderInfo.delivery_address}</p>
                                <p><strong>Hình thức:</strong> {orderInfo.payment_method === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản trực tuyến'}</p>
                            </div>
                            <button className="btn-go-history" onClick={() => navigate('/profile/orders')}>
                                <i className="fa-solid fa-list-check"></i> Xem lịch sử đơn hàng của tôi
                            </button>
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (GIỮ NGUYÊN) */}
                <div className="payment-right">
                    <div className="order-summary-card">
                        <h3>Đơn hàng đặt mua</h3>
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>SẢN PHẨM</th>
                                    <th>TẠM TÍNH</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name} x {item.quantity}</td>
                                        <td className="price-text">{(item.price * item.quantity).toLocaleString()} đ</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td>Tổng tiền đơn hàng</td>
                                    <td className="total-price">{totalPrice.toLocaleString()} đ</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;