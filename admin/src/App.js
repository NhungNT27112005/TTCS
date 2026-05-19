import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import AdminLayout from './frontend/AdminLayout';
import AdminProducts from './frontend/AdminProducts';
import Dashboard from './frontend/Dashboard';
import AdminOrders from './frontend/AdminOrders';
import AdminUsers from './frontend/AdminUsers';
import OrderDetail from './frontend/OrderDetail';

// ⭐ Kiểm tra token còn hợp lệ không (chưa hết hạn, đúng role admin)
const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const notExpired = payload.exp * 1000 > Date.now();
        const isAdmin = payload.role === "admin";
        return notExpired && isAdmin;
    } catch {
        return false;
    }
};

// ⭐ Route guard: chưa đăng nhập → redirect về /login
const ProtectedRoute = ({ children }) => {
    if (!isTokenValid()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AppContent = () => {
    const [adminUser, setAdminUser] = useState(() => {
        if (!isTokenValid()) return null;
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const handleLoginSuccess = (user) => {
        setAdminUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAdminUser(null);
    };

    return (
        <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

            {/* ⭐ Bọc toàn bộ admin routes trong ProtectedRoute */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AdminLayout adminUser={adminUser} onLogout={handleLogout} />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;