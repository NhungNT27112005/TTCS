import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
// Import Pages
import Login from './pages/Login';

//Import Admin Pages
import AdminLayout from './frontend/AdminLayout';
import AdminProducts from './frontend/AdminProducts';
import Dashboard from './frontend/Dashboard';
import AdminOrders from './frontend/AdminOrders';
import AdminUsers from './frontend/AdminUsers';
import OrderDetail from './frontend/OrderDetail';
const AppContent=()=>{
   //const location = useLocation();
   const [isAdmin, setIsAdmin] = useState(localStorage.getItem('adminToken'));
   if(!isAdmin){
    return <Login onLoginSuccess = {()=> setIsAdmin(true)} />;
   }
  return (
    <Routes>
      <Route path = "/login" element={<Login />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} /> 
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} /> 
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;