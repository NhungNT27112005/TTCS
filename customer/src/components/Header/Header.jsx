import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; 
import './Header.css';
import NotificationDropdown from '../Notification/NotificationDropdown';

const Header = () => {
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false); 

    // state thanh tìm kiếm 
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== '') {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };
    
    // Lấy dữ liệu người dùng từ trình duyệt
    const user = JSON.parse(localStorage.getItem('user'));

    // HÀM XỬ LÝ ĐĂNG XUẤT
    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.removeItem('user'); 
            navigate('/login');              
            window.location.reload();        
        }
    };

    return (
        <header className="main-header">
            <div className="header-top">
                {/* Logo */}
                <Link to="/" className="brand-logo">E-Tech</Link>

                {/* Thanh tìm kiếm */}
                <form className="search-bar" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Bạn tìm sản phẩm gì ..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </form>

                {/* Các Icon chức năng */}
                <div className="header-icons">
                    <Link title="Trang chủ" to="/"><i className="fa-solid fa-house"></i></Link>
                    
                    {/* Khu vực thông báo */}
                    <div className="notification-wrapper" onClick={() => setShowNotif(!showNotif)}>
                        <i className="fa-solid fa-bell"></i>
                        {showNotif && <NotificationDropdown />}
                    </div>

                    <Link title="Giỏ hàng" to="/cart">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </Link>

                    {/* --- KHU VỰC NGƯỜI DÙNG --- */}
                    {user ? (
                        <div className="user-control">
                            <Link title="Tài khoản" to="/profile">
                                <i className="fa-solid fa-circle-user"></i>
                                <span className="user-name">{user.email.split('@')[0]}</span>
                            </Link>

                            <button onClick={handleLogout} className="btn-logout" >
                               Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <Link title="Đăng nhập" to="/login">
                            <i className="fa-solid fa-circle-user"></i>
                            <span className="login-text">Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Thanh điều hướng danh mục */}
            <nav className="sub-nav">
                <NavLink to="/category/dien-thoai"><i className="fa-solid fa-mobile-screen"></i><span>Điện thoại</span></NavLink>
                <NavLink to="/category/laptop"><i className="fa-solid fa-laptop"></i><span>Laptop</span></NavLink>
                <NavLink to="/category/tai-nghe"><i className="fa-solid fa-headphones"></i><span>Tai nghe</span></NavLink>
                <NavLink to="/category/the-nho"><i className="fa-solid fa-sd-card"></i><span>Thẻ nhớ</span></NavLink>
            </nav>
        </header>
    );
};

export default Header;