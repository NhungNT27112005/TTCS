import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../Home/Home.css';

const SearchPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Hook để lấy các tham số từ URL
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            
            setLoading(true);
            try {
                // Gọi API search bạn đã viết ở Backend
                const response = await axios.get(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]); // Chạy lại khi từ khóa thay đổi

    return (
        <main className="product-section" style={{ padding: '40px 60px', minHeight: '70vh' }}>
            <h2 className="section-title">
                {query ? `Kết quả tìm kiếm cho: "${query}"` : "Vui lòng nhập từ khóa"}
            </h2>

            {loading ? (
                <div className="loading-box">Đang tìm kiếm sản phẩm...</div>
            ) : results.length > 0 ? (
                <div className="product-grid">
                    {results.map((product) => (
                        <Link 
                            to={`/products/${product.product_id}`} 
                            key={product.product_id} 
                            className="product-card"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <img src={product.image_url} alt={product.product_name} />
                            <h3>{product.product_name}</h3>
                            <span className="price">
                                {product.unit_price?.toLocaleString()}đ
                            </span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="no-results" style={{ textAlign: 'center', marginTop: '50px' }}>
                    <i className="fa-solid fa-box-open" style={{ fontSize: '50px', color: '#ccc' }}></i>
                    <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
                        Rất tiếc, không tìm thấy sản phẩm nào khớp với từ khóa của bạn.
                    </p>
                    <Link to="/" style={{ color: '#d70018', fontWeight: 'bold' }}>Quay lại trang chủ</Link>
                </div>
            )}
        </main>
    );
};

export default SearchPage;