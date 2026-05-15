import React, { useEffect, useState } from 'react';
import './ProductSuggestion.css';
import {Link, useNavigate} from "react-router-dom";

const ProductSuggestion = () => {
    const navigate = useNavigate();

    const [suggest, setSuggest] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchSuggestions = async () => {

            try {

                const response = await fetch(
                    "http://localhost:3000/product-suggest/product-suggest"
                );

                if (!response.ok) {
                    throw new Error("Lỗi khi lấy gợi ý sản phẩm");
                }

                const data = await response.json();

                setSuggest(data);

            } catch (err) {

                console.error(err);
                setError("Không thể tải gợi ý sản phẩm");

            }
        };

        fetchSuggestions();

    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!suggest.length) {
        return <p>Đang tải sản phẩm...</p>;
    }

    return (
        <div className="suggestions-wrapper">

            <div className="suggestions-header">
                <span className="ai-icon">✨</span>
                <h3>Sản phẩm gợi ý cho bạn</h3>
            </div>

            <div className="suggestions-grid">

                {suggest.map((item) => (
                  
                     <Link to={`/products/${item.product_id}`} key={item.product_id}  className="suggestion-card">
                        <div className="img-box">
                            <img
                                src={item.image_url}
                                alt={item.product_name}
                            />
                        </div>

                        <div className="info-box">

                            <h4>{item.product_name}</h4>

                            <p className="price">
                                {Number(item.unit_price).toLocaleString()}đ
                            </p>

                        </div>

                        </Link>

                ))}

            </div>

        </div>
    );
};

export default ProductSuggestion;