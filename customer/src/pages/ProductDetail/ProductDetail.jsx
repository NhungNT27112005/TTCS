import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductSuggestion from '../../components/ProductSuggestion/ProductSuggestion';
import './ProductDetail.css';

const ProductDetail = () => {
    // 2. Lấy ID từ thanh địa chỉ URL (ví dụ: /product/41 thì id = "41")
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/products/${id}`);
            const data = response.data;

            // Kiểm tra nếu có dữ liệu
            if (data) {
                // Nếu specs_json là chuỗi, ta parse nó. Nếu không có thì để object rỗng {}
                let parsedSpecs = {};
                try {
                    parsedSpecs = data.specs_json ? JSON.parse(data.specs_json) : {};
                } catch (e) {
                    console.error("Lỗi parse JSON specs:", e);
                }

                setProduct({
                    ...data,
                    specs: parsedSpecs 
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };
    fetchProduct();
}, [id]);


    const handleAddToCart = async () => {
    // 1. Lấy thông tin người dùng từ localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData) {
        alert("Vui lòng đăng nhập để mua hàng!");
        return;
    }

    try {
        const payload = {
            userId: userData.user_id, 
            productId: product.product_id,
            quantity: 1 
        };

        const response = await axios.post("http://localhost:3000/cart/add", payload);
        
        if (response.status === 200) {
            alert("Thêm vào giỏ hàng thành công! 🛒");
            // Có thể điều hướng sang trang giỏ hàng nếu muốn: navigate('/cart');
        }
    } catch (error) {
        console.error("Lỗi thêm giỏ hàng:", error);
        alert("Không thể thêm vào giỏ hàng. Thử lại sau!");
    }
  };

    // 4. Nếu không tìm thấy sản phẩm (gõ sai ID trên URL)
    if (!product) {
        return <div className="error-page"></div>;
    }

    return (
  <div className="product-detail-container">
    <div className="detail-wrapper">
      {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
      <div className="detail-left">
        <div className="main-image-card">
          <img src={product.image_url} alt={product.product_name} />
        </div>
      </div>

      {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
      <div className="detail-right">
        <h1 className="detail-name">{product.product_name}</h1>
        
        <div className="detail-price-box">
          <span className="detail-curr-price">
            {product.unit_price?.toLocaleString()}đ
          </span>
        </div>

        <button className="btn-add-to-cart" onClick={handleAddToCart}>
          <i className="fa-solid fa-cart-shopping"></i> THÊM VÀO GIỎ HÀNG
        </button>

        <div className="specs-section">
          <h3><i className="fa-solid fa-gear"></i> Thông số kỹ thuật</h3>
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
    <div className="detail-suggestion-section" style={{ marginTop: '50px' }}>
            <ProductSuggestion />
    </div>
  </div>
);
};

export default ProductDetail;