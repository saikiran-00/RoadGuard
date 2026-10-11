
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CitizenLogin.css";

const API_URL = "http://localhost:5000/api/auth";

function CitizenLogin() {
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const endpoint = isRegister ? "register" : "login";

            const payload = isRegister
                ? form
                : {
                    email: form.email,
                    password: form.password
                };

            const response = await axios.post(
                `${API_URL}/${endpoint}`,
                payload
            );

            if (isRegister) {
                setIsRegister(false);
                setForm({
                    name: "",
                    email: form.email,
                    password: ""
                });
                setMessageType("success");
                setMessage("Account created successfully. Please sign in.");
            } else {
                localStorage.setItem(
                    "citizenToken",
                    response.data.token
                );

                localStorage.setItem(
                    "citizenData",
                    JSON.stringify(response.data.user)
                );

                navigate("/");
            }
        } catch (error) {
            setMessageType("error");
            setMessage(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister((previous) => !previous);
        setMessage("");
        setForm({
            name: "",
            email: form.email,
            password: ""
        });
    };

    return (
        <div className="citizen-auth-page">
            <div className="citizen-auth-card">
                <Link to="/" className="citizen-auth-logo">
                    <span className="citizen-logo-icon">🚧</span>
                    <span>Road<span className="logo-accent">Guard</span></span>
                </Link>

                <div className="citizen-auth-heading">
                    <span className="citizen-auth-badge">
                        🛡️ CITIZEN PORTAL
                    </span>

                    <h1>
                        {isRegister ? "Create your account" : "Welcome back"}
                    </h1>

                    <p>
                        {isRegister
                            ? "Join us in building safer roads for everyone."
                            : "Sign in to continue making roads safer."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="citizen-auth-form">
                    {isRegister && (
                        <div className="citizen-form-group">
                            <label htmlFor="citizen-name">Full name</label>
                            <input
                                id="citizen-name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                maxLength={80}
                                required
                            />
                        </div>
                    )}

                    <div className="citizen-form-group">
                        <label htmlFor="citizen-email">Email address</label>
                        <input
                            id="citizen-email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="citizen-form-group">
                        <label htmlFor="citizen-password">Password</label>
                        <input
                            id="citizen-password"
                            type="password"
                            name="password"
                            placeholder={
                                isRegister
                                    ? "At least 8 characters"
                                    : "Enter your password"
                            }
                            value={form.password}
                            onChange={handleChange}
                            autoComplete={
                                isRegister ? "new-password" : "current-password"
                            }
                            minLength={isRegister ? 8 : undefined}
                            required
                        />
                    </div>

                    {message && (
                        <div
                            className={`citizen-auth-message ${messageType}`}
                            role="status"
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="citizen-auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isRegister
                                ? "Create Account →"
                                : "Sign In →"}
                    </button>
                </form>

                <div className="citizen-auth-switch">
                    <span>
                        {isRegister
                            ? "Already have an account?"
                            : "New to RoadGuard?"}
                    </span>

                    <button type="button" onClick={toggleMode}>
                        {isRegister ? "Sign in" : "Create account"}
                    </button>
                </div>

                <div className="citizen-auth-footer">
                    <span>🛡️</span>
                    Your community. Your roads. Your impact.
                </div>
            </div>
        </div>
    );
}

export default CitizenLogin;
