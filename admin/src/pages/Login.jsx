
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const navigate =
        useNavigate();

    const handleSubmit =
        async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data =
                await authService
                .loginAdminApi(
                    email,
                    password
                );

            // Chỉ admin được vào
            if (
                data.user?.role_id == 2
            ) {

                setError(
                    "Bạn không có quyền quản trị hệ thống!"
                );

                return;
            }

            // Lưu token + user
            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );

            // Callback login success
            if (
                onLoginSuccess
            ) {

                onLoginSuccess(
                    data.user
                );
            }

            // Chuyển trang admin
            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );

        } catch (err) {

            console.error(
                "Login Admin Error:",
                err
            );

            if (
                err.response?.data
            ) {

                setError(
                    err.response
                    .data.message
                    ||
                    "Đăng nhập thất bại!"
                );

            } else {

                setError(
                    "Không thể kết nối đến server!"
                );
            }

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-card">

                <h2 className="admin-login-title">
                    E-Tech Admin
                </h2>

                <p className="admin-login-sub">
                    Đăng nhập hệ thống quản trị
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="admin-login-form"
                >

                    <div className="admin-login-group">

                        <label className="admin-login-label">
                            Email
                        </label>

                        <input
                            className="admin-login-input"
                            type="email"
                            value={email}
                            required
                            placeholder="admin@etech.com"
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="admin-login-group">

                        <label className="admin-login-label">
                            Mật khẩu
                        </label>

                        <input
                            className="admin-login-input"
                            type="password"
                            value={password}
                            required
                            placeholder="••••••••"
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    {error && (
                        <p className="admin-login-error">
                            ⚠ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {
                            loading
                            ?
                            "Đang đăng nhập..."
                            :
                            "Đăng nhập"
                        }
                    </button>

                </form>

            </div>
        </div>
    );
};

export default Login;
