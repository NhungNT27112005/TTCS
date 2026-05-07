import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Bước 1: Email, 2: OTP, 3: MK mới
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Xử lý Gửi Email (Bước 1)
    const handleSendEmail = (e) => {
        e.preventDefault();
        alert(`Mã OTP đã được gửi đến: ${email}`);
        setStep(2);
    };

    // Xử lý Xác nhận OTP (Bước 2)
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (otp === "123456") { // Giả lập mã OTP chuẩn là 123456
            setStep(3);
        } else {
            alert("Mã OTP không chính xác! Thử lại với 123456");
        }
    };

    // Xử lý Đổi mật khẩu (Bước 3)
    const handleResetPassword = (e) => {
        e.preventDefault();
        alert("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Quên mật khẩu</h2>
                
                {/* BƯỚC 1: NHẬP EMAIL */}
                {step === 1 && (
                    <form onSubmit={handleSendEmail} className="auth-form">
                        <p className="auth-subtitle">Nhập email của bạn để nhận mã khôi phục.</p>
                        <div className="form-group">
                            <input 
                                type="email" placeholder="Email đăng ký" required 
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-auth">Gửi mã OTP</button>
                    </form>
                )}

                {/* BƯỚC 2: NHẬP OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <p className="auth-subtitle">Mã đã gửi tới <b>{email}</b></p>
                        <div className="form-group">
                            <input 
                                type="text" placeholder="Nhập mã OTP (6 số)" required 
                                value={otp} onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-auth">Xác nhận mã</button>
                        <button type="button" className="btn-back" onClick={() => setStep(1)}>Quay lại</button>
                    </form>
                )}

                {/* BƯỚC 3: MẬT KHẨU MỚI */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <p className="auth-subtitle">Tạo mật khẩu mới cho tài khoản của bạn.</p>
                        <div className="form-group">
                            <input 
                                type="password" placeholder="Mật khẩu mới" required 
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input type="password" placeholder="Xác nhận mật khẩu mới" required />
                        </div>
                        <button type="submit" className="btn-auth">Cập nhật mật khẩu</button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link to="/login">Trở về Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;