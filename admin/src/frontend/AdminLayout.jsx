import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLayout = ({ adminUser, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-logo">E-Tech Admin</div>
                <nav className="admin-nav">
                    <Link to="/"><i className="fa-solid fa-chart-line"></i> Tổng quan</Link>
                    <Link to="/products"><i className="fa-solid fa-box"></i> Sản phẩm</Link>
                    <Link to="/orders"><i className="fa-solid fa-cart-shopping"></i> Đơn hàng</Link>
                    <Link to="/users"><i className="fa-solid fa-users"></i> Khách hàng</Link>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <span>Xin chào, <strong>{adminUser?.username || "Admin"}</strong>!</span>
                    <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;