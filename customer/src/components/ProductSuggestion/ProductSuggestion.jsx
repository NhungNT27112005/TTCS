import React from 'react';
import './ProductSuggestion.css';

const ProductSuggestion = () => {
    
    const dummySuggestions = [
        { id: 1, name: "Tai nghe Bluetooth Sony", price: 1200000, img: "https://via.placeholder.com/150" },
        { id: 2, name: "Sạc nhanh 20W Type-C", price: 450000, img: "https://via.placeholder.com/150" },
        { id: 3, name: "Ốp lưng Silicone MagSafe", price: 350000, img: "https://via.placeholder.com/150" },
        { id: 4, name: "Cường lực KingKong", price: 150000, img: "https://via.placeholder.com/150" },
    ];

    return (
        <div className="suggestions-wrapper">
            <div className="suggestions-header">
                <span className="ai-icon">✨</span>
                <h3>Sản phẩm gợi ý cho bạn</h3>
            </div>
            
            <div className="suggestions-grid">
                {dummySuggestions.map((item) => (
                    <div key={item.id} className="suggestion-card">
                        <div className="img-box">
                            <img src={item.img} alt={item.name} />
                        </div>
                        <div className="info-box">
                            <h4>{item.name}</h4>
                            <p className="price">{item.price.toLocaleString()}đ</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSuggestion;