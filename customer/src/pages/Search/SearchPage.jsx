import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import productService from '../../services/productService'; // 🎯 IMPORT BƯU TÁ PRODUCT
import '../Home/Home.css';

const SearchPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                // 🎯 ỦY QUYỀN TÌM KIẾM QUA SERVICE
                const response = await productService.searchProductsApi(query);
                setResults(response.data);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [query]);

    return (
        <main className="home-container" style={{ minHeight: '70vh' }}>
            <section className="product-section" style={{ padding: '20px 0' }}>
                <h2 className="section-title">
                    {query ? `Kết quả tìm kiếm cho: "${query}"` : "Vui lòng nhập từ khóa"}
                </h2>

                {loading ? (
                    <div className="loading-box" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        Đang tìm kiếm sản phẩm...
                    </div>
                ) : results.length > 0 ? (
                    <div className="product-grid">
                        {results.map((product) => (
                            <Link to={`/products/${product.product_id}`} key={product.product_id} className="product-card-link">
                                <div className="product-card">
                                    <img src={product.image_url} alt={product.product_name} />
                                    <h3>{product.product_name}</h3>
                                    <span>{product.unit_price?.toLocaleString()}đ</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="no-results" style={{ textAlign: 'center', marginTop: '50px' }}>
                        <i className="fa-solid fa-box-open" style={{ fontSize: '50px', color: '#cbd5e1' }}></i>
                        <p style={{ fontSize: '16px', color: '#64748b', marginTop: '20px', marginBottom: '15px' }}>
                            Rất tiếc, không tìm thấy sản phẩm nào khớp với từ khóa của sếp.
                        </p>
                        <Link to="/" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                            Quay lại trang chủ mua sắm
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
};

export default SearchPage;