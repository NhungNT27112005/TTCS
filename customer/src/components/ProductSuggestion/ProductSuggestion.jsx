import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cartService from '../../services/cartService'; 
import './ProductSuggestion.css';

const ProductSuggestion = ({ productId, userId }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        setSuggestions([]);
        setLoading(true);

        const fetchSuggestions = async () => {
            const token = localStorage.getItem('token');

            try {
                // TRƯỜNG HỢP 1: XEM CHI TIẾT SẢN PHẨM (LẤY SẢN PHẨM TƯƠNG TỰ)
                if (productId) {
                    const res = await cartService.getSimilarProductsApi(productId);
                    setSuggestions(res.data || []);

                // TRƯỜNG HỢP 2: TRANG CHỦ (GỢI Ý THEO HÀNH VI USER)
                } else if (userId) {
                    if (!token) {
                        // Nếu khách chưa đăng nhập, gọi API gợi ý vãng lai công khai
                        const res = await cartService.getPersonalizedGuestApi(userId);
                        setSuggestions(res.data || []);
                        return;
                    }

                    // Lấy dữ liệu giỏ hàng thực tế thông qua service mới bọc
                    const cartRes = await cartService.getCartApi(userId);
                    const cartItems = cartRes.data || [];

                    if (cartItems.length > 0) {
                        const productIds = cartItems.map(i => i.product_id);
                        
                        // Bắn POST lên AI Service thông qua cấu trúc phân tầng phẳng
                        const res = await cartService.getPersonalizedFromCartApi(userId, productIds);
                        setSuggestions(res.data || []);
                    } else {
                        // Giỏ hàng trống thì gọi API gợi ý cá nhân hóa có token bảo mật
                        const res = await cartService.getPersonalizedMemberApi(userId);
                        setSuggestions(res.data || []);
                    }
                }
            } catch (error) {
                console.error("❌ Lỗi khi kết nối AI Service:", error.message);
                setSuggestions([]); 
            } finally {
                setLoading(false);
            }
        };

        if (productId || userId) {
            fetchSuggestions();
        } else {
            setLoading(false);
        }

    }, [productId, userId]);

    if (loading) return (
        <div className="suggestions-wrapper">
            <p style={{ textAlign: 'center', color: '#999' }}>✨ Đang tải gợi ý thông minh...</p>
        </div>
    );

    if (suggestions.length === 0) return null;

    return (
        <div className="suggestions-wrapper">
            <div className="suggestions-header">
                <span className="ai-icon">✨</span>
                <h3>{productId ? "Sản phẩm tương tự" : "Gợi ý dành riêng cho bạn"}</h3>
            </div>
            <div className="suggestions-grid">
                {suggestions.map((item, index) => {
                    const uniqueKey = item.product_id ? `suggest-${item.product_id}-${index}` : `suggest-fallback-${index}`;
                    
                    return (
                        <Link
                            to={`/products/${item.product_id}`}
                            key={uniqueKey}
                            className="suggestion-card-link"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            <div className="suggestion-card">
                                <div className="img-box">
                                    <img
                                        src={item.image_url || item.thumbnail_url || "/placeholder.png"}
                                        alt={item.product_name}
                                    />
                                </div>
                                <div className="info-box">
                                    <h4>{item.product_name}</h4>
                                    <p className="price">{item.unit_price?.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductSuggestion;