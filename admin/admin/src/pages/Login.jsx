import React, { useState } from 'react';
import './Login.css';

const AdminLogin = ({ onLoginSuccess }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setError('');
        setLoading(true);

        try {

            const response = await fetch(
                'http://localhost:5000/api/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            // lấy response text trước
            const text =
                await response.text();

            console.log(
                'SERVER RESPONSE:',
                text
            );

            let data;

            try {

                data =
                    JSON.parse(text);

            } catch {

                throw new Error(
                    'Backend không trả JSON'
                );
            }

            // login success
            if (response.ok) {

                localStorage.setItem(
                    'adminUser',
                    JSON.stringify(
                        data.user
                    )
                );

                onLoginSuccess(
                    data.user
                );

            } else {

                setError(
                    data.message ||
                    'Đăng nhập thất bại!'
                );
            }

        } catch (err) {

            console.error(err);

            setError(
                'Lỗi: ' +
                err.message
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-box">

                <div className="admin-login-header">
                    <h1>E-TECH ADMIN</h1>
                    <p>Hệ thống quản trị nội bộ</p>
                </div>

                <form
                    className="admin-login-form"
                    onSubmit={handleLogin}
                >

                    {error && (
                        <div className="login-error-msg">
                            {error}
                        </div>
                    )}

                    <div className="input-group">

                        <label>
                            Tài khoản quản trị
                        </label>

                        <div className="input-wrapper">

                            <i className="fa-solid fa-envelope"></i>

                            <input
                                type="email"
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target
                                            .value
                                    )
                                }
                                required
                            />

                        </div>
                    </div>

                    <div className="input-group">

                        <label>
                            Mật khẩu
                        </label>

                        <div className="input-wrapper">

                            <i className="fa-solid fa-lock"></i>

                            <input
                                type="password"
                                placeholder="Điền mật khẩu tại đây"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target
                                            .value
                                    )
                                }
                                required
                            />

                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-admin-login"
                        disabled={loading}
                    >
                        {loading
                            ? 'Đang đăng nhập...'
                            : 'Xác nhận đăng nhập'}
                    </button>

                </form>

                <div className="admin-login-footer">
                    <p>
                        &copy; E-Tech Management System
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;