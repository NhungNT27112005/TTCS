import React from 'react';
import {
    Link,
    Outlet
} from 'react-router-dom';

import './Admin.css';

const AdminLayout = () => {

    const handleLogout = () => {

        const confirmLogout =
            window.confirm(
                'Bạn có chắc muốn đăng xuất?'
            );

        if (!confirmLogout)
            return;

        // xóa login
        localStorage.removeItem(
            'adminUser'
        );

        // reload app
        window.location.reload();
    };

    return (
        <div className="admin-container">

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <div className="admin-logo">
                    E-Tech Admin
                </div>

                <nav className="admin-nav">

                    <Link to="/">
                        <i className="fa-solid fa-chart-line"></i>
                        Tổng quan
                    </Link>

                    <Link to="/products">
                        <i className="fa-solid fa-box"></i>
                        Sản phẩm
                    </Link>

                    <Link to="/orders">
                        <i className="fa-solid fa-cart-shopping"></i>
                        Đơn hàng
                    </Link>

                    <Link to="/users">
                        <i className="fa-solid fa-users"></i>
                        Khách hàng
                    </Link>

                </nav>
            </aside>

            {/* Main */}
            <main className="admin-main">

                <header className="admin-topbar">

                    <span>
                        Xin chào, Admin!
                    </span>

                    <button
                        className="btn-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        Đăng xuất
                    </button>

                </header>

                <div className="admin-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
};

export default AdminLayout;