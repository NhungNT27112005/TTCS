import React, { useEffect, useState } from 'react';
import userService from '../services/userService'; // 🌟 Import Service mới
import './Admin.css';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi tải users:", err);
            setUsers([]);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const updateRole = async (id, role_id) => {
        try {
            await userService.updateUserRole(id, role_id);
            alert('Cập nhật quyền thành công!');
            loadUsers();
        } catch (err) { alert('Lỗi cập nhật quyền!'); }
    };

    const updateStatus = async (id, is_active) => {
        try {
            await userService.updateUserStatus(id, is_active);
            loadUsers();
        } catch (err) { alert('Lỗi đổi trạng thái!'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Xóa người dùng này?")) return;
        try {
            await userService.deleteUser(id);
            loadUsers();
        } catch (err) { alert('Lỗi xóa người dùng!'); }
    };
    const filteredUsers = users.filter(u => 
        u.username?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h2>Quản lý người dùng</h2>
                <input type="text" placeholder="Tìm kiếm user..." className="admin-search"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Tên</th><th>Email</th><th>SĐT</th>
                        <th>Role</th><th>Trạng thái</th><th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.user_id}>
                            <td>#{user.user_id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.phone_number}</td>
                            <td>
                                {/* role_id=2 là Admin, role_id=1 là Customer */}
                                <select value={user.role_id}
                                    onChange={e => updateRole(user.user_id, e.target.value)}>
                                    <option value="2">Admin</option>
                                    <option value="1">Customer</option>
                                </select>
                            </td>
                            <td>
                                <button
                                    className={user.is_active ? 'btn-active' : 'btn-block'}
                                    onClick={() => updateStatus(user.user_id, !user.is_active)}>
                                    {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                                </button>
                            </td>
                            <td>
                                <button className="btn-delete" onClick={() => deleteUser(user.user_id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;