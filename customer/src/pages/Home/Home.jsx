import React, { useState, useEffect } from 'react';
import productService from '../../services/productService'; // 🎯 IMPORT BƯU TÁ PRODUCT
import './Home.css';
import ProductSuggestion from '../../components/ProductSuggestion/ProductSuggestion';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user'));
  const [visibleCount, setVisibleCount] = useState(20); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 🎯 ỦY QUYỀN TRUYỀN TIN QUA SERVICE
        const response = await productService.getAllProductsApi();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 10); 
  };

  return (
    <main className="home-container">
      <section className="hero-section">
        <div className="hero-text">
          <h2>Thế giới thiết bị điện tử thông minh<br /> E-Tech</h2>
          <button className="btn-buy">Mua ngay</button>
        </div>
        <div className="hero-image">
          <img src="/banner.png" alt="Banner E-Tech" className="banner-img" />
        </div>
      </section>

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

        {visibleCount < products.length && (
          <div className="see-more-container">
            <button className="btn-see-more" onClick={handleShowMore}>
              Xem thêm sản phẩm <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>
        )}
      </section>

      <section className="promo-section">
        <div className="promo-card">
          <div className="promo-header">
            <i className="fa-solid fa-percent promo-icon"></i>
            <span className="promo-text">Khuyến mãi đặc biệt</span>
          </div>
          <div className="promo-content">
            <div className="promo-item"><span className="promo-label">Giảm đến</span><span className="promo-value">50%</span></div>
            <div className="promo-divider"></div>
            <div className="promo-item"><span className="promo-value">25%</span></div>
            <div className="promo-divider"></div>
            <div className="promo-item"><span className="promo-value">20%</span></div>
          </div>
        </div>
      </section>

      <section className="product-section">
        <h2 className="section-title">Gợi ý dành riêng cho bạn</h2>
        <ProductSuggestion userId={userData?.user_id} />
      </section>
    </main>
  );
};

export default Home;