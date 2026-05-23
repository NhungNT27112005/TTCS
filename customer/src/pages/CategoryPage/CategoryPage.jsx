import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService'; // 🎯 IMPORT BƯU TÁ PRODUCT
import './CategoryPage.css';

const CategoryPage = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20); 

    const catMapping = { 'laptop': 1, 'dien-thoai': 2, 'tai-nghe': 3, 'the-nho': 4 };

    const handleAddToCart = async (productId, event) => {
        event?.preventDefault();
        event?.stopPropagation();
        try {
            await productService.addToCartApi(productId, 1);
            alert('Đã thêm vào giỏ hàng!');
        } catch (error) {
            console.error('Lỗi thêm vào giỏ hàng:', error);
            alert('Vui lòng đăng nhập hoặc thử lại sau!');
        }
    };
    const categoryTitles = { 'dien-thoai': 'Điện thoại', 'laptop': 'Laptop', 'tai-nghe': 'Tai nghe', 'the-nho': 'Sạc' };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); 
            try {
                const catId = catMapping[slug] || 1;
                // 🎯 ỦY QUYỀN LẤY THEO DANH MỤC QUA SERVICE
                const response = await productService.getProductsByCategoryApi(catId);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false); 
            }
        };
        fetchProducts();
    }, [slug]);

    const handleShowMore = () => {
        setVisibleCount((prevCount) => prevCount + 10); 
    };

    return (
        <main className="page-container">
            <h1 className="page-title">{categoryTitles[slug] || 'Sản phẩm'}</h1>
            <div className="content-layout">
                <section className="product-area">
                    <div className="product-grid">
                        {loading ? (
                            <div className="loading-box">Đang tải sản phẩm...</div>
                        ) : products.length > 0 ? (
                            products.slice(0, visibleCount).map((product) => (
                                <div key={product.product_id} className="product-card">
                                <Link to={`/products/${product.product_id}`} className="product-item-link">
                                    <div className="product-image">
                                        <img src={product.image_url} alt={product.product_name} />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.product_name}</h3>
                                        <p className="product-price">{product.unit_price?.toLocaleString()}đ</p>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    className="btn-add-to-cart"
                                    onClick={(event) => handleAddToCart(product.product_id, event)}
                                >
                                    <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
                                </button>
                            </div>
                            ))
                        ) : (
                            <div className="no-products">Không có sản phẩm nào trong danh mục này.</div>
                        )}
                    </div>
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