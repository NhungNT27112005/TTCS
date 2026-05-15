import React, {
    useEffect,
    useState
} from 'react';
import './Admin.css';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const loadUsers = async () => {
        try {
            const response = await fetch(
                'http://localhost:5000/api/users'
            );
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        loadUsers();
    }, []);

    // UPDATE ROLe

    const updateRole = async (
        id,
        role_id
    ) => {
        try {
            await fetch(
                `http://localhost:5000/api/users/${id}/role`,

                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        role_id
                    })
                }
            );
            loadUsers();
        } catch (err) {
            console.log(err);
        }
    };
    
    // UPDATE STATUS
    const updateStatus = async (
        id,
        is_active
    ) => {
        try {
            await fetch(
                `http://localhost:5000/api/users/${id}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        is_active
                    })
                }
            );
            loadUsers();
        } catch (err) {
            console.log(err);
        }
    };

    // DELETE USER
  
    const deleteUser = async (id) => {
        const confirmDelete =
            window.confirm(
                'Bạn có chắc muốn xóa user này?'
            );
        if (!confirmDelete) return;

        try {
            await fetch(
                `http://localhost:5000/api/users/${id}`,
                {
                    method: 'DELETE'
                }
            );
            loadUsers();
        } catch (err) {
            console.log(err);
        }
    };

    // filler 
    const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
        user.username
            ?.toLowerCase()
            .includes(search.toLowerCase())

        ||

        user.email
            ?.toLowerCase()
            .includes(search.toLowerCase())
    )
    : [];
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h2>
                    Quản lý người dùng
                </h2>

                <input
                    type="text"
                    placeholder="Tìm kiếm user..."
                    className="admin-search"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Role</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        filteredUsers.map(user => (
                            <tr key={user.user_id}>
                                <td>
                                    #{user.user_id}
                                </td>
                                <td>
                                    {user.username}
                                </td>
                                <td>
                                    {user.email}
                                </td>
                                <td>
                                    {user.phone_number}
                                </td>
                                <td>
                                    <select
                                        value={user.role_id}
                                        onChange={(e) =>
                                            updateRole(
                                                user.user_id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="1">
                                            Customer
                                        </option>
                                        <option value="2">
                                            Admin
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className={
                                            user.is_active
                                            ? 'btn-active'
                                            : 'btn-block'
                                        }
                                        onClick={() =>
                                            updateStatus(
                                                user.user_id,
                                                !user.is_active
                                            )
                                        }
                                    >
                                        {
                                            user.is_active
                                            ? 'Hoạt động'
                                            : 'Đã khóa'
                                        }
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn-delete"
                                        onClick={() =>
                                            deleteUser(
                                                user.user_id
                                            )
                                        }
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};
export default AdminUsers;