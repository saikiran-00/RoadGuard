import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        try {

            const response = await axios.post(
                "http://localhost:5000/api/admin/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "adminToken",
                response.data.token
            );

            localStorage.setItem(
                "adminData",
                JSON.stringify(response.data.admin)
            );

            navigate("/admin/dashboard");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Admin login failed"
            );

        }
    };

    return (

        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-icon">
                    🛡️
                </div>

                <h1>RoadGuard Admin</h1>

                <p className="admin-login-subtitle">
                    Secure administrator access
                </p>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter admin email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    {error && (
                        <div className="admin-login-error">
                            {error}
                        </div>
                    )}

                    <button type="submit">
                        Login to Dashboard
                    </button>

                </form>

            </div>

        </div>

    );
}

export default AdminLogin;