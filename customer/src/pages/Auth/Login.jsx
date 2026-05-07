import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
       try {
            // Gửi yêu cầu đăng nhập lên Backend
            const response = await axios.post("http://localhost:3000/login", {
                email: email,
                password: password
            });

            if (response.status === 200) {
                const userData = response.data.user;

                // 1. Lưu thông tin User vào localStorage
                // Quan trọng: Lưu cả user_id để dùng cho chức năng Giỏ hàng sau này
                localStorage.setItem('user', JSON.stringify(userData));

                alert(`Chào mừng ${userData.full_name || userData.email}!`);

                // 2. Điều hướng dựa trên quyền (role)
                if (userData.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
                
                // Reload để Header cập nhật trạng thái đã đăng nhập
                window.location.reload(); 
            }
        } catch (error) {
            // Hiển thị lỗi từ Backend (401: Sai pass, 500: Lỗi server)
            const message = error.response?.data?.message || "Lỗi kết nối đến máy chủ!";
            alert(message);
        }
    };

    return (
        <div className="auth-container">
            {/* Nút quay về trang chủ nhanh */}
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
                        <>  </>
                   
                </div>

                <button type="submit" className="btn-auth">Đăng nhập</button>
                 <Link to="/forgot-password">Quên mật khẩu?</Link>
                <p className="auth-switch">
                    Bạn mới biết đến E-Tech? <Link to="/register">Đăng ký ngay</Link>
                </p>
                
                
            </form>
        </div>
    );
};

export default Login;