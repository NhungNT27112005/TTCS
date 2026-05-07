import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import './Auth.css'; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', // Đã đổi từ fullName thành username
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Hàm cập nhật state khi nhập liệu
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => { // Thêm async ở đây
        e.preventDefault();
        
        // Kiểm tra mật khẩu khớp nhau
        if(formData.password !== formData.confirmPassword) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/register", {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.status === 201) {
                alert(response.data.message);
                navigate('/login'); // Đăng ký xong chuyển sang trang đăng nhập
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi khi đăng ký tài khoản!";
            alert(msg);
        }
    };

    return (
        <div className="auth-container">
            <Link to="/" className="back-to-home">
                <i className="fa-solid fa-arrow-left"></i> Về trang chủ
            </Link>

            <form className="auth-form" onSubmit={handleRegister}>
                <div className="auth-header">
                    <h1 className="auth-logo">E-Tech</h1>
                    <h2>Tạo tài khoản mới</h2>
                    <p>Cùng trải nghiệm mua sắm công nghệ đỉnh cao</p>
                </div>

                <div className="input-group">
                    <label>Tên người dùng</label>
                    <input 
                        type="text" 
                        name="username" 
                        placeholder="Nhập tên người dùng..." 
                        required 
                        value={formData.username}
                        onChange={handleChange}
                    />
                </div>

                <div className="input-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Ví dụ: customer@gmail.com" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="input-group">
                    <label>Mật khẩu</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Tối thiểu 6 ký tự" 
                        required 
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <div className="input-group">
                    <label>Xác nhận mật khẩu</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Nhập lại mật khẩu" 
                        required 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-auth">Đăng ký ngay</button>
                
                <p className="auth-switch">
                    Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;