import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService"; // 🌟 Sử dụng file service cho admin sếp vừa tách
import "./Login.css"; 

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 🌟 Thay thế toàn bộ cụm fetch cũ bằng hàm gọi qua tầng API Service của Admin
            const data = await authService.loginAdminApi(email, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (onLoginSuccess) onLoginSuccess(data.user);
            navigate("/", { replace: true });

        } catch (err) {
            // Đọc thông báo lỗi trả về từ Backend thông qua Axios (err.response.data)
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Đăng nhập thất bại!");
            } else {
                setError("Không thể kết nối đến server!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <h2 className="admin-login-title">E-Tech Admin</h2>
                <p className="admin-login-sub">Đăng nhập hệ thống quản trị</p>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-login-group">
                        <label className="admin-login-label">Email</label>
                        <input 
                            className="admin-login-input" 
                            type="email" 
                            value={email} 
                            required
                            placeholder="admin@etech.com"
                            onChange={e => setEmail(e.target.value)} 
                        />
                    </div>
                    <div className="admin-login-group">
                        <label className="admin-login-label">Mật khẩu</label>
                        <input 
                            className="admin-login-input" 
                            type="password" 
                            value={password} 
                            required
                            placeholder="••••••••"
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    {error && <p className="admin-login-error">⚠ {error}</p>}

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;