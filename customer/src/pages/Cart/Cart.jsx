import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import cartService from '../../services/cartService'; // 🎯 GỌI BƯU TÁ CART SERVICE
import orderService from '../../services/orderService';
import './Cart.css';

const Cart = () => {
    // Giữ nguyên 100% đống State thô ban đầu của sếp để né bug UI
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [orderInfo, setOrderInfo] = useState({
        delivery_address: '',
        payment_method: 'COD',
        delivery_method: 'Giao hàng nhanh',
        note: ''
    });
    
    useEffect(() => {
        fetchCart();
        const storedUser = localStorage.getItem('user');
        if(storedUser) {
            const userData = JSON.parse(storedUser);
            if(userData.default_address) {
                setOrderInfo(prev => ({ ...prev, delivery_address: userData.default_address }));
            }
        }
    }, []);

    const fetchCart = async () => {
        try {
            const storedUser = localStorage.getItem('user'); 
            if (!storedUser) { setLoading(false); return; }
            const userData = JSON.parse(storedUser);

            // 🎯 THAY THẾ: Gọi qua hàm getCartApi của service thay vì gọi api.get thô
            const response = await cartService.getCartApi(userData.user_id);
            
            // Giữ nguyên cấu trúc map dữ liệu thô gốc của sếp không đổi một chữ
            const formattedItems = response.data.map(item => ({
                id: item.cart_id,
                productId: item.product_id,
                name: item.product_name,
                price: item.unit_price,
                image: item.image_url,
                quantity: item.quantity,
                selected: true 
            }));
            setCartItems(formattedItems);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
        } finally {
            setLoading(false); 
        }
    }; 

    const updateQuantity = async (id, productId, delta) => {
        const targetItem = cartItems.find(item => item.id === id);
        if (!targetItem) return;
        const newQty = targetItem.quantity + delta;
        if (newQty < 1) return;

        try {
            // 🎯 THAY THẾ: Gọi qua hàm addToCartApi của service thay vì gọi api.post thô
            await cartService.addToCartApi(productId, delta);
            setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
        } catch (error) {
            alert("Không thể cập nhật số lượng!");
        }
    };

    const removeCartItem = async (id, productId) => {
        try {
            await cartService.removeFromCartApi(productId);
            setCartItems(cartItems.filter(item => item.id !== id));
        } catch (error) {
            console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', error);
            alert('Không thể xóa sản phẩm, thử lại sau!');
        }
    };

    const handleInputChange = (e) => {
        setOrderInfo({ ...orderInfo, [e.target.name]: e.target.value });
    };

    const totalPrice = cartItems.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!orderInfo.delivery_address.trim()) { alert("Vui lòng nhập địa chỉ nhận hàng!"); return; }
        if (cartItems.length === 0) { alert("Giỏ hàng của bạn đang trống!"); return; }

        try {
            // 🎯 THAY THẾ: Gọi qua hàm checkoutApi của service thay vì gọi api.post thô
            const response = await orderService.checkoutApi(orderInfo);
            
            if (response.status === 201) {
                alert("Đặt hàng thành công!");
                navigate('/payment', { 
                    state: { total: totalPrice, items: cartItems, orderInfo: orderInfo } 
                });
            }
        } catch (error) {
            alert("Lỗi khi đặt hàng: " + (error.response?.data?.message || "Thử lại sau"));
        }
    };

    if (loading) return <div className="cart-container"><p className="loading">Đang xử lý dữ liệu hệ thống...</p></div>;

    return (
        <main className="cart-container">
            <h1 className="page-title">Thông tin đơn hàng của bạn</h1>
            <div className="cart-layout">
                <div className="cart-items-section">
                    <h3>Sản phẩm đặt mua ({cartItems.length})</h3>
                    {cartItems.length > 0 ? (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item-card selected">
                                <img src={item.image} alt={item.name} className="item-img" />
                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <p className="item-price">{item.price.toLocaleString()}đ</p>
                                </div>
                                <div className="item-actions">
                                    <div className="item-quantity">
                                        <button onClick={() => updateQuantity(item.id, item.productId, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.productId, 1)}>+</button>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-remove-item"
                                        onClick={() => removeCartItem(item.id, item.productId)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-cart"><p>Giỏ hàng trống rỗng!</p><Link to="/">Quay lại mua sắm</Link></div>
                    )}
                </div>

                <aside className="cart-summary">
                    <form onSubmit={handleCheckout} className="checkout-form">
                        <h3>Thông tin giao nhận</h3>
                        <div className="form-group">
                            <label>Địa chỉ nhận hàng *</label>
                            <input 
                                type="text" name="delivery_address" required
                                value={orderInfo.delivery_address} onChange={handleInputChange}
                                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Phương thức vận chuyển</label>
                            <select name="delivery_method" value={orderInfo.delivery_method} onChange={handleInputChange}>
                                <option value="Giao hàng nhanh">Giao hàng nhanh (Khuyên dùng)</option>
                                <option value="Giao hàng tiết kiệm">Giao hàng tiết kiệm</option>
                                <option value="Hỏa tốc">Hỏa tốc E-Tech (Trong ngày)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Phương thức thanh toán</label>
                            <select name="payment_method" value={orderInfo.payment_method} onChange={handleInputChange}>
                                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Ghi chú đơn hàng (Nếu có)</label>
                            <textarea 
                                name="note" rows="2" maxLength="100"
                                value={orderInfo.note} onChange={handleInputChange}
                                placeholder="Lưu ý cho shipper, thời gian nhận hàng..."
                            />
                        </div>

                        <div className="price-summary-box">
                            <div className="summary-row total">
                                <span>Tổng tiền thanh toán:</span>
                                <span className="final-price">{totalPrice.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-checkout" disabled={cartItems.length === 0}>
                            XÁC NHẬN ĐẶT HÀNG
                        </button>
                    </form>
                </aside>
            </div>
        </main>
    );
};

export default Cart;