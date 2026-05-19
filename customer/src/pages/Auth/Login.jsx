import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';  
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 🎯 ỦY QUYỀN TRUYỀN TIN CHOuserService XỬ LÝ KHÉP KÍN
            const response = await userService.loginApi(email, password);
            
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            if (response.status === 200) {
                const userData = response.data.user;
                alert(`Chào mừng ${userData.username || userData.email}!`);

                if (userData.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi kết nối đến máy chủ!";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Link to="/" className="back-to-home">
                <i className="fa-solid fa-arrow-left"></i> Về trang chủ
            </Link>

            <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-header">
                    <h1 className="auth-logo">E-Tech</h1>
                    <h2>Thế giới điện tử thông minh</h2>
                </div>

                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Nhập email của bạn..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-options">
                    <label><input type="checkbox" /> Ghi nhớ tôi</label>
                </div>

                <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <Link to="/forgot-password">Quên mật khẩu?</Link>

                <p className="auth-switch">
                    Bạn mới biết đến E-Tech? <Link to="/register">Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;