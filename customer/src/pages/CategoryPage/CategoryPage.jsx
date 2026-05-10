import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './CategoryPage.css';
import ProductSuggestion from '../../components/ProductSuggestion/ProductSuggestion';


const CategoryPage = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const catMapping = {
        'laptop': 1,
        'dien-thoai': 2,
        'tai-nghe': 3,
        'the-nho': 4
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); 
            try {
                const catId = catMapping[slug] || 1;
                const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
                const response = await axios.get(`${baseUrl}/category/${catId}`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false); 
            }
        };

        fetchProducts();
    }, [slug]);

     // Hàm xử lý hiển thị thêm sản phẩm
      const [visibleCount, setVisibleCount] = useState(20); // Số lượng sản phẩm hiển thị ban đầu
      const handleShowMore = () => {
        setVisibleCount((prevCount) => prevCount + 10); 
      };


    const categoryTitles = {
        'dien-thoai': 'Điện thoại',
        'laptop': 'Laptop',
        'tai-nghe': 'Tai nghe',
        'the-nho': 'Thẻ nhớ'
    };


    return (
        <main className="page-container">
            <h1 className="page-title">{categoryTitles[slug] || 'Sản phẩm'}</h1>
            <div className="content-layout">
                

                {/* --- KHU VỰC HIỂN THỊ SẢN PHẨM --- */}
                <section className="product-area">
                    <div className="product-grid">
                        {loading ? (
                            <div className="loading-box">Đang tải sản phẩm...</div>
                        ) : products.length > 0 ? (
                            products.slice(0, visibleCount).map((product) => (
                                <Link to={`/products/${product.product_id}`} key={product.product_id} className="product-item-link">
                                    <div className="product-card">
                                        <div className="product-image">
                                            <img src={product.image_url} alt={product.product_name} />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.product_name}</h3>
                                            <p className="product-price">
                                                {product.unit_price?.toLocaleString()}đ
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-products">Không có sản phẩm nào trong danh mục này.</div>
                        )}
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
               
            </div>
        </main>
    );
};

export default CategoryPage;