import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Cột 1: Thông tin thương hiệu */}
        <div className="footer-column">
          <h2 className="footer-logo">E-Tech</h2>
          <p className="footer-desc">Thế giới thiết bị điện tử thông minh, trải nghiệm công nghệ đỉnh cao</p>
        </div>
        
         {/* Cột 2: Liên hệ */}
        <div className="footer-column">
          <h3 className="footer-title">Liên hệ</h3>
          <p><i className="fa-solid fa-location-dot"></i> 123 Đường ABC, Hà Nội</p>
          <p><i className="fa-solid fa-phone"></i> Hotline: 1900 1234</p>
          <p><i className="fa-solid fa-envelope"></i> Email: support@etech.com</p>
        </div>

        {/* Cột 3: Chính sách */}
        <div className="footer-column">
          <h3 className="footer-title">Danh mục</h3>
          <ul>
            <li><Link to="/category/dien-thoai">Điện thoại</Link></li>
            <li><Link to="/category/laptop">Laptop</Link></li>
            <li><Link to="/category/tai-nghe">Tai nghe</Link></li>
            <li><Link to="/category/the-nho">Thẻ nhớ</Link></li>
          </ul>
        </div>

       
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 E-Tech Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;