import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {

    const [stats, setStats] = useState(null);

    useEffect(() => {

        fetch("http://localhost:5000/api/stats/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
            })
            .catch(err => {
                console.log(err);
            });

    }, []);

    if (!stats) {
        return <h2 className="loading">Loading...</h2>;
    }

    return (

        <div className="dashboard">

            <h1 className="dashboard-title">
                Tổng quan thống kê
            </h1>

            {/* Cards */}

            <div className="stats-grid">

                <div className="stat-card">
                    <h3>Tổng người dùng</h3>
                    <p>{stats.totalUsers}</p>
                </div>

                <div className="stat-card">
                    <h3>Tổng sản phẩm</h3>
                    <p>{stats.totalProducts}</p>
                </div>

                <div className="stat-card">
                    <h3>Tổng đơn hàng</h3>
                    <p>{stats.totalOrders}</p>
                </div>

                <div className="stat-card">
                    <h3>Doanh thu</h3>

                    <p>
                        {Number(stats.totalRevenue).toLocaleString()} VNĐ
                    </p>
                </div>

                <div className="stat-card">
                    <h3>Đơn hàng đang chờ</h3>
                    <p>{stats.pendingOrders}</p>
                </div>

            </div>

            {/* Low stock */}

            <div className="table-container">

                <h2>Sản phẩm sắp hết hàng</h2>

                <table>

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng tồn kho</th>
                        </tr>
                    </thead>

                    <tbody>

                        {stats.lowStockProducts.map(product => (

                            <tr key={product.product_id}>

                                <td>{product.product_id}</td>

                                <td>{product.product_name}</td>

                                <td>
                                    <span className="stock-badge">
                                        {product.stock_quantity}
                                    </span>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Recent orders */}

            <div className="table-container">

                <h2>Đơn hàng gần đây</h2>

                <table>

                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Khách hàng</th>
                            <th>Tổng cộng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>

                        {stats.recentOrders.map(order => (

                            <tr key={order.order_id}>

                                <td>{order.order_id}</td>

                                <td>{order.username}</td>

                                <td>
                                    {Number(order.total_cost).toLocaleString()} VNĐ
                                </td>

                                <td>

                                    <span className={`status ${order.order_status.toLowerCase()}`}>

                                        {order.order_status}

                                    </span>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );
}