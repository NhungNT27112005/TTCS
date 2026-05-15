import React from 'react';
import { useState, useEffect } from 'react';
import './NotificationDropdown.css'; 

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:3000/notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="notification-dropdown">
      <h3 className="notif-title">Thông báo mới nhận</h3>
      <div className="notif-list">
        {notifications.map((n) => (
          <div key={n.id} className="notif-item">
            <div className="notif-banner">
              <i className="fa-solid fa-gift gift-icon"></i>
              <span>{n.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;