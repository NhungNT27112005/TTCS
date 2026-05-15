import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import './App.css';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminLayout from './frontend/AdminLayout';
import AdminProducts from './frontend/AdminProducts';
import Dashboard from './frontend/Dashboard';
import AdminOrders from './frontend/AdminOrders';
import AdminUsers from './frontend/AdminUsers';
import OrderDetail from './frontend/OrderDetail';

const AppContent = () => {

    const [adminUser,
        setAdminUser] =
        useState(
            JSON.parse(
                localStorage.getItem(
                    "adminUser"
                )
            )
        );

    // chưa login
    if (!adminUser) {

        return (
            <Login
                onLoginSuccess={
                    (user) => {

                    localStorage.setItem(
                        "adminUser",
                        JSON.stringify(
                            user
                        )
                    );

                    setAdminUser(
                        user
                    );
                }}
            />
        );
    }

    return (
        <Routes>

            <Route
                path="/login"
                element={
                    <Login />
                }
            />

            <Route
                path="/"
                element={
                    <AdminLayout />
                }
            >
                <Route
                    index
                    element={
                        <Dashboard />
                    }
                />

                <Route
                    path="products"
                    element={
                        <AdminProducts />
                    }
                />

                <Route
                    path="orders"
                    element={
                        <AdminOrders />
                    }
                />

                <Route
                    path="orders/:id"
                    element={
                        <OrderDetail />
                    }
                />

                <Route
                    path="users"
                    element={
                        <AdminUsers />
                    }
                />

            </Route>

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