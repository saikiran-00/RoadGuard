
import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import CitizenLogin from "./CitizenLogin";
import Menu from "./components/Menu";

import ReportDamage from "./pages/ReportDamage";
import MapPage from "./pages/Map";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

import "./App.css";

// Home page
function Home() {
    return (
        <main className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-badge">
                        🛡️ SMARTER ROADS, SAFER JOURNEYS
                    </span>

                    <h1>
                        Report Road Damage.
                        <br />
                        <span>Protect Every Journey.</span>
                    </h1>

                    <p>
                        Report potholes, cracks, and damaged roads.
                        Help your community work toward safer journeys.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/report" className="primary-btn">
                            Report Road Damage →
                        </Link>

                        <Link to="/map" className="secondary-btn">
                            Explore Road Map
                        </Link>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="road-illustration">🛣️</div>
                    <h3>Safer roads start with you.</h3>
                    <p>Your community. Your roads. Your impact.</p>
                </div>
            </section>

            <section className="how-section">
                <div className="section-heading">
                    <h2>How RoadGuard Works</h2>
                    <p>Three simple steps to support road safety.</p>
                </div>

                <div className="how-cards">
                    <article className="how-card">
                        <div className="how-icon">📸</div>
                        <h3>1. Report Damage</h3>
                        <p>
                            Upload a photo and describe the road damage.
                        </p>
                    </article>

                    <article className="how-card">
                        <div className="how-icon">📍</div>
                        <h3>2. Add Location</h3>
                        <p>
                            Select the location using GPS or the map.
                        </p>
                    </article>

                    <article className="how-card">
                        <div className="how-icon">🏗️</div>
                        <h3>3. Support Action</h3>
                        <p>
                            Help authorities identify roads needing attention.
                        </p>
                    </article>
                </div>
            </section>

            <section className="home-cta">
                <h2>See a pothole? Make a difference.</h2>
                <p>Every report can help improve road safety.</p>

                <Link to="/report" className="primary-btn">
                    Submit a Report →
                </Link>
            </section>
        </main>
    );
}

// Not-found page
function NotFound() {
    return (
        <main className="coming-soon">
            <h1>Page Not Found</h1>
            <p>The page you requested does not exist.</p>
            <Link to="/" className="back-home-btn">
                Back to Home
            </Link>
        </main>
    );
}

// Application layout and navigation
function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const [citizen, setCitizen] = useState(() => {
        try {
            const token = localStorage.getItem("citizenToken");
            const user = JSON.parse(
                localStorage.getItem("citizenData")
            );

            return token && user ? user : null;
        } catch {
            return null;
        }
    });

    const isAdminPage = location.pathname.startsWith("/admin");
    const isLoginPage = location.pathname === "/login";

    useEffect(() => {
        try {
            const token = localStorage.getItem("citizenToken");
            const user = JSON.parse(
                localStorage.getItem("citizenData")
            );

            setCitizen(token && user ? user : null);
        } catch {
            setCitizen(null);
        }

        setMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("citizenToken");
        localStorage.removeItem("citizenData");

        setCitizen(null);
        setMenuOpen(false);
        navigate("/");
    };

    return (
        <>
            {!isAdminPage && (
                <header className="app-header">
                    <Link
                        to="/"
                        className="brand-logo"
                        onClick={() => setMenuOpen(false)}
                    >
                        🛡️ Road
                        <span className="brand-accent">Guard</span>
                    </Link>

                    <nav className="main-navigation">
                        <Link to="/">Home</Link>
                        <Link to="/report">Report Damage</Link>
                        <Link to="/map">Road Map</Link>
                        <Link to="/my-reports">My Reports</Link>
                    </nav>

                    <div className="header-actions">
                        {citizen ? (
                            <>
                                <span className="login-link">
                                    Hi, {citizen.name}
                                </span>

                                <button
                                    type="button"
                                    className="login-link"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="login-link">
                                Sign In
                            </Link>
                        )}

                        <button
                            type="button"
                            className="menu-toggle"
                            onClick={() =>
                                setMenuOpen((previous) => !previous)
                            }
                            aria-label="Toggle navigation menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </header>
            )}

            {menuOpen && !isAdminPage && (
                <div
                    className="menu-overlay"
                    onClick={() => setMenuOpen(false)}
                >
                    <div
                        className="menu-panel"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="menu-close"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            ✕
                        </button>

                        <Menu />
                    </div>
                </div>
            )}

            <Routes>
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* Citizen authentication */}
                <Route
                    path="/login"
                    element={<CitizenLogin />}
                />

                {/* Real road damage reporting component */}
                <Route
                    path="/report"
                    element={<ReportDamage />}
                />

                {/* Real map component */}
                <Route
                    path="/map"
                    element={<MapPage />}
                />

                {/* Citizen pages not connected yet */}
                <Route
                    path="/my-reports"
                    element={
                        <NotReady title="My Reports" />
                    }
                />

                <Route
                    path="/rewards"
                    element={
                        <NotReady title="Community Rewards" />
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <NotReady title="Notifications" />
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <NotReady title="Settings" />
                    }
                />

                {/* Admin authentication and dashboard */}
                <Route
                    path="/admin"
                    element={<AdminLogin />}
                />

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                {/* Information pages */}
                <Route
                    path="/services"
                    element={<NotReady title="Our Services" />}
                />

                <Route
                    path="/how-it-works"
                    element={<NotReady title="How It Works" />}
                />

                <Route
                    path="/help"
                    element={<NotReady title="Help Center" />}
                />

                <Route
                    path="/contact"
                    element={<NotReady title="Contact Us" />}
                />

                <Route
                    path="/about"
                    element={<NotReady title="About RoadGuard" />}
                />

                <Route path="*" element={<NotFound />} />
            </Routes>

            {!isAdminPage && !isLoginPage && (
                <footer className="app-footer">
                    <Link to="/" className="footer-brand">
                        🛡️ RoadGuard
                    </Link>

                    <p>
                        Building safer roads through community action.
                    </p>

                    <p className="footer-copy">
                        © {new Date().getFullYear()} RoadGuard.
                        All rights reserved.
                    </p>
                </footer>
            )}
        </>
    );
}

// Temporary placeholder for unfinished pages
function NotReady({ title }) {
    return (
        <main className="coming-soon">
            <h1>{title}</h1>
            <p>This feature is not connected yet.</p>
            <Link to="/" className="back-home-btn">
                Back to Home
            </Link>
        </main>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}
