import axios from "axios";

// Cấu hình riêng cho Admin (trỏ về cổng Backend 5001)
const adminApi = axios.create({ 
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001" 
});

// Tự động gắn token vào header mỗi request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Content-Type"] = "application/json";
  return config;
});

export default adminApi;