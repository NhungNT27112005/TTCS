import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import orderService from "../services/orderService"; // 🌟 Import Service
import "./Admin.css";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders(); 
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi fetch đơn hàng:", err);
            setOrders([]);
        }
    };

    useEffect(() => { fetchOrders(); }, []);
    
    return (
        <div className="admin-card">
            <h2>Quản lý đơn hàng</h2>
            <div className="admin-card-header">
                <div className="admin-header-actions">
                    <input type="text" placeholder="Tìm mã đơn..." className="search-input"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="order-filter" value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPING">Shipping</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Mã đơn</th><th>Khách hàng</th><th>SĐT</th>
                        <th>Tổng tiền</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {orders
                        .filter(o => {
                            const matchSearch = String(o.order_id).toLowerCase().includes(search.toLowerCase());
                            const matchStatus = statusFilter === "" ? true : o.order_status?.toUpperCase() === statusFilter;
                            return matchSearch && matchStatus;
                        })
                        .map(o => (
                            <tr key={o.order_id}>
                                <td>{o.order_id}</td>
                                <td>{o.username}</td>
                                <td>{o.phone_number}</td>
                                <td>{Number(o.total_cost).toLocaleString()}đ</td>
                                <td>
                                    <span className={`status ${o.order_status?.toLowerCase()}`}>
                                        {o.order_status}
                                    </span>
                                </td>
                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-detail" onClick={() => navigate(`/orders/${o.order_id}`)}>
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default Orders;