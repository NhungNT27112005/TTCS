import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async()=>{
        try {
            const storedUser = localStorage.getItem('user'); 
            if(!storedUser) {
                setLoading(false);
                return;
            }
            const userData = JSON.parse(storedUser);

            const response = await axios.get(`http://localhost:3000/cart/${userData.user_id}`);
            const formattedItems = response.data.map(item => ({
                id: item.cart_id,
                productId: item.product_id,
                name: item.product_name,
                price: item.unit_price,
                image: item.image_url,
                quantity: item.quantity,
                selected: false 
            }));
            setCartItems(formattedItems);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
            setLoading(false);
        }
    }; 

    // hàm cập nhật số lượng sản phẩm trong giỏ hàng
    const updateQuantity = (id, delta) => {
        setCartItems(cartItems.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };
    // hàm toggle chọn sản phẩm
    const toggleSelect = (id) => {
        setCartItems(cartItems.map(item => 
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };
    // hàm toggle chọn tất cả sản phẩm
    const toggleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setCartItems(cartItems.map(item => ({ ...item, selected: isChecked })));
    };
    // hàm xóa sản phẩm khỏi giỏ hàng
    const removeItem = (id) => {
        if(window.confirm("Xóa sản phẩm này khỏi giỏ hàng?")) {
            setCartItems(cartItems.filter(item => item.id !== id));
        }
    };
// tính tổng số sản phẩm được chọn và tổng tiền của các sản phẩm đó
    const selectedCount = cartItems.filter(item => item.selected).length;
    const totalPrice = cartItems
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    // --- HÀM XỬ LÝ THANH TOÁN ---
    const handleCheckout = () => {
        const selectedItems = cartItems.filter(item => item.selected);
        
        // Chuyển sang trang checkout và mang theo dữ liệu tiền + danh sách món hàng
        navigate('/payment', { 
            state: { 
                total: totalPrice, 
                items: selectedItems 
            } 
        });
    };

    return (
        <main className="cart-container">
            <h1 className="page-title">Giỏ hàng của bạn</h1>
            
            <div className="cart-layout">
                <div className="cart-items-section">
                    {cartItems.length > 0 ? (
                        <>
                            <div className="select-all-bar">
                                <input 
                                    type="checkbox" 
                                    id="select-all" 
                                    onChange={toggleSelectAll}
                                    checked={selectedCount === cartItems.length && cartItems.length > 0}
                                />
                                <label htmlFor="select-all">Chọn tất cả ({cartItems.length} sản phẩm)</label>
                            </div>

                            {cartItems.map(item => (
                                <div key={item.id} className={`cart-item-card ${item.selected ? 'selected' : ''}`}>
                                    <div className="checkbox-wrapper">
                                        <input 
                                            type="checkbox" 
                                            checked={item.selected} 
                                            onChange={() => toggleSelect(item.id)}
                                            className="product-checkbox"
                                        />
                                    </div>
                                    <img src={item.image} alt={item.name} className="item-img" />
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <p className="item-price">{item.price.toLocaleString()}đ</p>
                                    </div>
                                    <div className="item-quantity">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                    <button className="btn-remove" onClick={() => removeItem(item.id)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="empty-cart">
                            <p>Giỏ hàng trống rỗng!</p>
                            <Link to="/">Tiếp tục mua sắm</Link>
                        </div>
                    )}
                </div>

                <aside className="cart-summary">
                    <div className="summary-card">
                        <h3>Tóm tắt đơn hàng</h3>
                        <div className="summary-row">
                            <span>Tạm tính ({selectedCount} món):</span>
                            <span>{totalPrice.toLocaleString()}đ</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>Miễn phí</span>
                        </div>
                        <hr />
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span className="final-price">{totalPrice.toLocaleString()}đ</span>
                        </div>
                        
                        {/* Nút thanh toán đã được gắn hàm handleCheckout */}
                        <button 
                            className="btn-checkout" 
                            disabled={selectedCount === 0}
                            onClick={handleCheckout}
                        >
                            {selectedCount > 0 ? `Thanh toán (${selectedCount})` : 'Vui lòng chọn sản phẩm'}
                        </button>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Cart;