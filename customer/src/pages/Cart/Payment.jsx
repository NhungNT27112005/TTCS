import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
    const location = useLocation();
    
    // Lấy dữ liệu từ Cart truyền sang
    const totalPrice = location.state?.total || 0;
    const selectedItems = location.state?.items || [];

    const [showQR, setShowQR] = useState(false); // Trạng thái hiện mã QR
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    const handlePayment = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }
        setShowQR(true); // Hiện màn hình QR
    };

    return (
        <div className="payment-container">
            <h1 className="payment-title">CHI TIẾT ĐƠN HÀNG</h1>

            {/* Stepper */}
            <div className="stepper">
                <div className={`step ${!showQR ? 'active' : ''}`}>
                    <div className="step-icon"><i className="fa-solid fa-file-invoice"></i></div>
                    <p>Thông tin thanh toán</p>
                </div>
                <div className="step-line"></div>
                <div className={`step ${showQR ? 'active' : ''}`}>
                    <div className="step-icon"><i className="fa-solid fa-qrcode"></i></div>
                    <p>Quét mã QR</p>
                </div>
                <div className="step-line"></div>
                <div className="step">
                    <div className="step-icon"><i className="fa-solid fa-trophy"></i></div>
                    <p>Hoàn tất</p>
                </div>
            </div>

            <div className="payment-content">
                {/* Cột trái: Form hoặc Mã QR */}
                <div className="payment-left">
                    {!showQR ? (
                        <>
                            <h3>Thông tin thanh toán</h3>
                            <form className="payment-form">
                                <div className="form-group">
                                    <label>Tên khách hàng *</label>
                                    <input type="text" placeholder="Họ tên của bạn" required 
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ Email *</label>
                                    <input type="email" placeholder="emailcuaban@gmail.com" required 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input type="text" placeholder="Số điện thoại" 
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="qr-display-section">
                            <h3>Thanh toán bằng mã QR</h3>
                            <div className="qr-card">
                                <p>Vui lòng quét mã QR dưới đây để thanh toán</p>
                                {/* Thay URL dưới đây bằng link ảnh QR thật của bạn */}
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CHUYEN_KHOAN_DON_HANG" alt="QR Code" className="qr-image" />
                                <div className="bank-details">
                                    <p><strong>Ngân hàng:</strong> MB Bank</p>
                                    <p><strong>Chủ tài khoản:</strong> NGUYEN VAN A</p>
                                    <p><strong>Số tiền:</strong> <span className="highlight">{totalPrice.toLocaleString()} đ</span></p>
                                    <p><strong>Nội dung:</strong> <span className="highlight">THANHTOAN {Math.floor(Math.random()*10000)}</span></p>
                                </div>
                            </div>
                            <button className="btn-cancel-qr" onClick={() => setShowQR(false)}>Quay lại sửa thông tin</button>
                        </div>
                    )}
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="payment-right">
                    <div className="order-summary-card">
                        <h3>Đơn hàng của bạn</h3>
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
                                    <td>Tổng cộng</td>
                                    <td className="total-price">{totalPrice.toLocaleString()} đ</td>
                                </tr>
                            </tbody>
                        </table>

                        {!showQR && (
                            <button className="btn-submit-payment" onClick={handlePayment}>
                                Thực hiện thanh toán
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;