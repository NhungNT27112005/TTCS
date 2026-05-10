import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ProductSuggestion.css';

const ProductSuggestion = ({ productId }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                const userId = userData?.user_id;
                const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
                const queryParams = [];
                if (productId) queryParams.push(`productId=${productId}`);
                if (userId) queryParams.push(`userId=${userId}`);
                const endpoint = `${baseUrl}/recommendations${queryParams.length ? `?${queryParams.join('&')}` : ''}`;
                const response = await axios.get(endpoint);
                setSuggestions(response.data || []);
            } catch (error) {
                console.error('Lỗi lấy gợi ý sản phẩm:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [productId]);

    return (
        <div className="suggestions-wrapper">
            <div className="suggestions-header">
                <span className="ai-icon">✨</span>
                <h3>Sản phẩm gợi ý cho bạn</h3>
            </div>

            {loading ? (
                <p className="suggestions-loading">Đang tải gợi ý...</p>
            ) : suggestions.length === 0 ? (
                <p className="suggestions-empty">Chưa có gợi ý phù hợp.</p>
            ) : (
                <div className="suggestions-grid">
                    {suggestions.map((item) => (
                        <Link key={item.product_id} to={`/products/${item.product_id}`} className="suggestion-card-link">
                            <div className="suggestion-card">
                                <div className="img-box">
                                    <img src={item.image_url} alt={item.product_name} />
                                </div>
                                <div className="info-box">
                                    <h4>{item.product_name}</h4>
                                    <p className="brand">{item.brand}</p>
                                    <p className="price">{item.unit_price?.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductSuggestion;
