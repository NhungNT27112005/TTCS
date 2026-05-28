import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import productService from '../../services/productService'; // 🎯 IMPORT BƯU TÁ PRODUCT
import ProductSuggestion from '../../components/ProductSuggestion/ProductSuggestion';
import { refreshCartRecommendations } from '../../services/aiService';  
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isSpecsOpen, setIsSpecsOpen] = useState(false);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.user_id;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // 🎯 ỦY QUYỀN LẤY CHI TIẾT QUA SERVICE
                const response = await productService.getProductDetailApi(id);
                const data = response.data;
                if (data) {
                    let parsedSpecs = {};
                    try {
                        parsedSpecs = data.specs_json ? JSON.parse(data.specs_json) : {};
                    } catch (e) {
                        console.error("Lỗi parse JSON specs:", e);
                    }
                    setProduct({ ...data, specs: parsedSpecs });
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vui lòng đăng nhập tài khoản để thực hiện mua hàng!");
            return;
        }
        try {
            // 🎯 ỦY QUYỀN THÊM GIỎ HÀNG QUA SERVICE (TỰ ĐÍNH TOKEN)
            const response = await productService.addToCartApi(product.product_id, 1);
            if (response.status === 200) {
                alert("Thêm vào giỏ hàng thành công! 🛒");
                if (userId) await refreshCartRecommendations(userId);
            }
        } catch (error) {
            alert("Không thể thêm vào giỏ hàng: " + (error.response?.data?.message || "Thử lại sau!"));
        }
    };

    if (!product) return <div className="error-page"></div>;

    return (
        <div className="product-detail-container">
            <div className="detail-wrapper">
                <div className="detail-left">
                    <div className="main-image-card">
                        <img src={product.image_url || product.thumbnail_url} alt={product.product_name} />
                    </div>
                </div>

                <div className="detail-right">
                    <h1 className="detail-name">{product.product_name}</h1>
                    <div className="detail-price-box">
                        <span className="detail-curr-price">{product.unit_price?.toLocaleString()}đ</span>
                    </div>
                    <button className="btn-add-to-cart" onClick={handleAddToCart}>
                        <i className="fa-solid fa-cart-shopping"></i> THÊM VÀO GIỎ HÀNG
                    </button>
                    <div className={`specs-section ${isSpecsOpen ? 'is-open' : ''}`}>
                        <div className="specs-header" onClick={() => setIsSpecsOpen(!isSpecsOpen)}>
                            <h3><i className="fa-solid fa-gear"></i> Thông số kỹ thuật</h3>
                            <i className={`fa-solid fa-chevron-down arrow-icon ${isSpecsOpen ? 'rotate' : ''}`}></i>
                        </div>
                        <div className="specs-content">
                            <table className="specs-table">
                                <tbody>
                                    {Object.entries(product.specs || {}).map(([key, value]) => (
                                        <tr key={key}>
                                            <td className="spec-label">{key}</td>
                                            <td className="spec-value">{String(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-suggestion-section" style={{ marginTop: '50px' }}>
                <h2 className="section-title">Sản phẩm tương tự</h2>
                <ProductSuggestion productId={id} />
            </div>
        </div>
    );
};

export default ProductDetail;