import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import ProductSuggestion from '../../components/ProductSuggestion/ProductSuggestion';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseUrl}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Hàm xử lý hiển thị thêm sản phẩm
  const [visibleCount, setVisibleCount] = useState(20); // Số lượng sản phẩm hiển thị ban đầu
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 10); 
  };

  return (
    <main className="home-container">
      {/* 1. Hero Section - Banner quảng cáo */}
      <section className="hero-section">
        <div className="hero-text">
          <h2>Thế giới thiết bị điện tử thông minh<br /> E-Tech</h2>
          <button className="btn-buy">Mua ngay</button>
        </div>
        <div className="hero-image">
          <img src="/banner.png" alt="Banner E-Tech" className="banner-img" />
        </div>
      </section>
    
    {/* 1.2. Khám phá sản phẩm */}

      <section className="product-section">
        <h2 className="section-title">Khám phá sản phẩm</h2>
        <div className="product-grid">
            {products.slice(0, visibleCount).map((product) => (
                <Link to={`/products/${product.product_id}`} key={product.product_id} className="product-card-link">
                <div className="product-card">
                  <img src={product.image_url} alt={product.product_name} />
                  <h3>{product.product_name}</h3>
                  <span>{product.unit_price?.toLocaleString()}đ</span>
                </div>
              </Link>
            ))}
        </div>

        {/* nút xem thêm  */}
        {visibleCount < products.length && (
          <div className="see-more-container">
            <button className="btn-see-more" onClick={handleShowMore}>
              Xem thêm sản phẩm <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>
        )}
      </section>

 {/* 2. Promo Section - Khuyến mãi đặc biệt */}
<section className="promo-section">
  <div className="promo-card">
    {/* Tiêu đề có icon phía trước */}
    <div className="promo-header">
      <i className="fa-solid fa-percent promo-icon"></i>
      <span className="promo-text">Khuyến mãi đặc biệt</span>
    </div>

    {/* Danh sách các mức giảm giá */}
    <div className="promo-content">
      <div className="promo-item">
        <span className="promo-label">Giảm đến</span>
        <span className="promo-value">50%</span>
      </div>
      
      <div className="promo-divider"></div> {/* Đường kẻ dọc */}
      
      <div className="promo-item">
        <span className="promo-value">25%</span>
      </div>
      
      <div className="promo-divider"></div>
      
      <div className="promo-item">
        <span className="promo-value">20%</span>
      </div>
    </div>
  </div>
</section>

      {/* 3. Product Section - Sản phẩm gợi ý */}
      <section className="product-section">
        <ProductSuggestion />
      </section>
    </main>
  );
};

export default Home;