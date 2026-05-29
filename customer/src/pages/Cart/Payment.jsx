import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService'; // 🎯 ĐÃ ĐỔI ĐƯỜNG DẪN: Dùng dịch vụ tập trung
import './Payment.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const existingOrderId = location.state?.orderId;

    const deliveryMethodLabels = {
        'Fast Shipping': 'Giao hàng nhanh',
        'Economy Shipping': 'Giao hàng tiết kiệm',
        'Express Shipping': 'Hỏa tốc E-Tech (Trong ngày)'
    };

    const translateDeliveryMethod = (method) => deliveryMethodLabels[method] || method;

    // Lấy dữ liệu từ Cart truyền sang hoặc từ đơn hàng đã tồn tại
    const totalFromLocation = location.state?.total || 0;
    const itemsFromLocation = location.state?.items || [];
    const infoFromLocation = location.state?.orderInfo;

    const [loading, setLoading] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(Boolean(existingOrderId));
    const [orderStep, setOrderStep] = useState(1); // 1: Xem thông tin, 2: Hoàn tất đơn hàng
    const [createdOrderId, setCreatedOrderId] = useState('');
    const [orderStatus, setOrderStatus] = useState(location.state?.orderStatus || '');
    const [selectedItems, setSelectedItems] = useState(itemsFromLocation);
    const [totalPrice, setTotalPrice] = useState(totalFromLocation);
    const [orderInfo, setOrderInfo] = useState(infoFromLocation || {
        delivery_address: '',
        payment_method: 'COD',
        delivery_method: 'Fast Shipping',
        note: ''
    });
    const [existingOrder, setExistingOrder] = useState(Boolean(existingOrderId));

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

    useEffect(() => {
        if (!existingOrderId) return;

        const fetchExistingOrder = async () => {
            try {
                setLoadingOrder(true);
                const response = await orderService.getOrderDetailApi(existingOrderId);
                const summary = response.data.orderSummary;
                const items = response.data.items || [];

                const mappedItems = items.map(item => ({
                    name: item.product_name || item.product_id || 'Sản phẩm',
                    quantity: item.quantity || 0,
                    price: item.unit_price_at_sale || item.price || 0
                }));

                const total = mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

                setOrderInfo({
                    delivery_address: summary.delivery_address || '',
                    payment_method: summary.payment_method || 'COD',
                    delivery_method: summary.delivery_method || 'Fast Shipping',
                    note: summary.note || ''
                });
                setSelectedItems(mappedItems);
                setTotalPrice(total || summary.total_cost || 0);
                setOrderStatus(summary.order_status || '');
            } catch (error) {
                console.error('Lỗi khi lấy thông tin đơn hàng:', error);
                alert('Không thể tải thông tin thanh toán cho đơn hàng này.');
            } finally {
                setLoadingOrder(false);
            }
        };

        fetchExistingOrder();
    }, [existingOrderId]);

    // HÀM GỌI API ĐẨY ĐƠN HÀNG XUỐNG DATABASE SQL SERVER
    const handleConfirmOrder = async () => {
        try {
            setLoading(true);

            if (existingOrder && existingOrderId) {
                const response = await orderService.updateOrderStatusApi(existingOrderId, 'DELIVERED');
                if (response.status === 200) {
                    setCreatedOrderId(existingOrderId);
                    setOrderStep(2);
                }
            } else {
                const response = await orderService.checkoutApi(orderInfo);
                if (response.status === 201) {
                    setCreatedOrderId(
                        response.data.order_id
                    );
                    // COD → thành công luôn
                    if (
                        orderInfo.payment_method
                        === "COD"
                    ) {
                        navigate(
                            "/profile/orders"
                        );
                        return;
                    }
                    // Chuyển khoản mới sang bước 2
                    setOrderStep(2);
                }
            }
        } catch (error) {
            console.error(existingOrder ? "Lỗi cập nhật trạng thái đơn hàng:" : "Lỗi tạo đơn hàng:", error);
            alert(existingOrder
                ? "Xác nhận thanh toán thất bại. Vui lòng thử lại!"
                : "Xử lý đơn hàng thất bại: " + (error.response?.data?.message || "Vui lòng thử lại!"));
        } finally {
            setLoading(false);
        }
    };

    if (loadingOrder) {
        return <div className="payment-loading">Đang tải thông tin đơn hàng...</div>;
    }

    return (
        <div className="payment-container">
            <h1 className="payment-title">XÁC NHẬN THANH TOÁN ĐƠN HÀNG</h1>

            {/* Cấu trúc thanh Stepper tiến trình */}
        
        <div className="stepper">
            <div className="step active">
                <div className="step-icon">
                    <i className="fa-solid fa-file-invoice"></i>
                </div>
                <p>
                    Thông tin thanh toán
                </p>
        </div>

    {/* Chỉ hiện bước 2 nếu KHÔNG phải COD */}
    {
        orderInfo.payment_method !== "COD" && (
            <>
                <div className="step-line"></div>
                <div
                    className={`step ${
                        orderStep === 2
                        ? 'active'
                        : ''
                    }`}
                >
                    <div className="step-icon">
                        <i className="fa-solid fa-trophy"></i>
                    </div>

                    <p>
                        Hoàn tất đơn hàng
                    </p>
                </div>
            </>
        )
    }

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
                                    {selectedItems.length > 0 && totalPrice > 0 ? (
                                        <button className="btn-confirm-payment" onClick={handleConfirmOrder} disabled={loading}>
                                            {loading ? "Đang xử lý hệ thống..." : "Tôi đã chuyển khoản thành công"}
                                        </button>
                                    ) : (
                                        <p className="empty-cart-note">Giỏ hàng trống, không có đơn hàng để xác nhận.</p>
                                    )}
                                </div>
                            ) : (
                                /* TRƯỜNG HỢP 2: KHÁCH CHỌN PHƯƠNG THỨC THANH TOÁN COD */
                          
<div className="cod-info-section">

    <div className="payment-card">

        <div className="payment-header">
            <div className="payment-icon">
                <i className="fa-solid fa-truck-fast"></i>
            </div>

            <div>
                <h3>
                    Thanh toán khi nhận hàng (COD)
                </h3>

                <p className="payment-subtitle">
                    Thanh toán bằng tiền mặt
                    khi đơn hàng giao tới bạn
                </p>
            </div>
        </div>

        <div className="payment-note-box">
            <i className="fa-solid fa-circle-info"></i>

            <span>
                Đơn hàng sẽ được xác nhận
                sau khi giao hàng thành công.
                Vui lòng chuẩn bị tiền mặt
                khi nhận hàng.
            </span>
        </div>

        <div className="delivery-info">

            <div className="info-row">
                <span>Địa chỉ giao hàng</span>
                <strong>
                    {orderInfo.delivery_address
                    || "Chưa cập nhật"}
                </strong>
            </div>

            <div className="info-row">
                <span>Phương thức giao</span>

                <strong>
                    {translateDeliveryMethod(
                        orderInfo.delivery_method
                    )}
                </strong>
            </div>

            <div className="info-row">
                <span>Tổng thanh toán</span>

                <strong className="price-highlight">
                    {totalPrice.toLocaleString()} đ
                </strong>
            </div>

        </div>

        {selectedItems.length > 0 &&
        totalPrice > 0 ? (

            <button
                className="btn-confirm-payment"
                onClick={handleConfirmOrder}
                disabled={loading}
            >

                {
                    loading
                    ? "Đang xử lý..."
                    : "Xác nhận đặt hàng"
                }

            </button>

        ) : (

            <p className="empty-cart-note">
                Giỏ hàng đang trống
            </p>

        )}

    </div>

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