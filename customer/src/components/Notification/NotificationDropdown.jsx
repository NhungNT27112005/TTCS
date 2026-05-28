import React, { useState, useEffect } from 'react';
import './NotificationDropdown.css';

const NotificationDropdown = () => {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    const fetchNotifications = async () => {

      try {

        // URL backend customer
        const baseUrl =
          process.env.REACT_APP_API_BASE_URL ||
          'http://localhost:5000';

        // Gọi API notification
        const response = await fetch(
          `${baseUrl}/api/notifications`
        );

        if (!response.ok) {
          throw new Error('Không thể tải thông báo');
        }

        const data = await response.json();

        setNotifications(data);

      } catch (error) {

        console.error(
          "Error fetching notifications:",
          error
        );

      }
    };

    fetchNotifications();

  }, []);

  return (
    <div className="notification-dropdown">

      <h3 className="notif-title">
        Thông báo mới nhận
      </h3>

      <div className="notif-list">

        {notifications.length > 0 ? (

          notifications.map((n) => (

            <div
              key={n.id}
              className="notif-item"
            >

              <div className="notif-banner">

                <i className="fa-solid fa-gift gift-icon"></i>

                <div className="notif-content">

                  <strong>
                    {n.title}
                  </strong>

                  <span>
                    {n.message}
                  </span>

                </div>

              </div>

            </div>
          ))

        ) : (

          <div className="notif-empty">
            Không có thông báo nào
          </div>

        )}

      </div>
    </div>
  );
};

export default NotificationDropdown;
