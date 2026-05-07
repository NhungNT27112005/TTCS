import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ phone_number: '', default_address: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData.user_id; 

        const response = await axios.get(`http://localhost:3000/profile/${userId}`);
        setUser(response.data);
        setEditData({
          phone_number: response.data.phone_number || '',
          default_address: response.data.default_address || ''
        });
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/profile/${user.user_id}`, editData);
      alert("Cập nhật thành công!");
      setIsEditing(false);
      setUser({ ...user, ...editData });
    } catch (error) {
      alert("Lỗi khi lưu thông tin");
    }
  };

  if (loading) return <div className="profile-status">Đang tải thông tin...</div>;
  if (!user) return <div className="profile-status">Vui lòng đăng nhập để xem thông tin!</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card">
        <h2 className="card-title">Tài khoản</h2>
        
        <div className="card-content">
          <div className="info-section">
            <div className="input-row">
              <label>Username:</label>
              <input type="text" value={user.username} disabled />
            </div>

            <div className="input-row">
              <label>Email:</label>
              <input type="text" value={user.email} disabled />
            </div>

            <div className="input-row">
              <label>PhoneNumber:</label>
              <input 
                type="text" 
                value={editData.phone_number} 
                onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                disabled={!isEditing}
                placeholder="Chưa cập nhật số điện thoại"
              />
            </div>

            <div className="input-row">
              <label>Address:</label>
              <input 
                type="text" 
                value={editData.default_address} 
                onChange={(e) => setEditData({...editData, default_address: e.target.value})}
                disabled={!isEditing}
                placeholder="Chưa cập nhật địa chỉ"
              />
            </div>
          </div>

          <div className="avatar-section">
            <div className="default-avatar-placeholder">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
        </div>

        <div className="button-group">
          {isEditing ? (
            <button className="btn-save" onClick={handleSave}>Save</button>
          ) : (
            <button className="btn-save" onClick={() => setIsEditing(true)}>Edit</button>
          )}
          
          <button className="btn-logout" onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;