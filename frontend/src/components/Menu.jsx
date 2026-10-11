
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";

function Menu() {
    const [open, setOpen] = useState(false);

    const closeMenu = () => setOpen(false);

    return (
        <>
            <button
                className="menu-button"
                onClick={() => setOpen(!open)}
                aria-label="Open navigation menu"
                aria-expanded={open}
            >
                {open ? "×" : "☰"}
            </button>

            {open && (
                <>
                    <div
                        className="menu-overlay"
                        onClick={closeMenu}
                    />

                    <aside className="side-menu">
                        <div className="side-menu-header">
                            <h2>🛡️ RoadGuard</h2>

                            <button
                                className="menu-close"
                                onClick={closeMenu}
                                aria-label="Close menu"
                            >
                                ×
                            </button>
                        </div>

                        <p className="menu-tagline">
                            Safer roads. Together.
                        </p>

                        <div className="menu-divider" />

                        <p className="menu-title">ACCOUNT</p>

                        <Link
                            to="/login"
                            onClick={closeMenu}
                            className="menu-link"
                        >
                            👤 Citizen Login
                        </Link>

                        <Link
                            to="/admin"
                            onClick={closeMenu}
                            className="menu-link admin-link"
                        >
                            🛡️ Admin Login
                        </Link>

                        <div className="menu-divider" />

                        <p className="menu-title">ROADGUARD</p>

                        <Link to="/" onClick={closeMenu} className="menu-link">
                            🏠 Home
                        </Link>

                        <Link to="/report" onClick={closeMenu} className="menu-link">
                            🚧 Report Damage
                        </Link>

                        <Link to="/map" onClick={closeMenu} className="menu-link">
                            🗺️ Road Map
                        </Link>

                        <Link to="/my-reports" onClick={closeMenu} className="menu-link">
                            📋 My Reports
                        </Link>

                        <Link to="/rewards" onClick={closeMenu} className="menu-link">
                            🏆 Rewards
                        </Link>

                        <div className="menu-divider" />

                        <p className="menu-title">INFORMATION</p>

                        <Link to="/services" onClick={closeMenu} className="menu-link">
                            🛠️ Services
                        </Link>

                        <Link to="/how-it-works" onClick={closeMenu} className="menu-link">
                            📖 How It Works
                        </Link>

                        <Link to="/help" onClick={closeMenu} className="menu-link">
                            ❓ Help & FAQ
                        </Link>

                        <Link to="/contact" onClick={closeMenu} className="menu-link">
                            📞 Contact Us
                        </Link>

                        <Link to="/about" onClick={closeMenu} className="menu-link">
                            ℹ️ About RoadGuard
                        </Link>

                        <div className="menu-divider" />

                        <p className="menu-title">APP</p>

                        <Link to="/settings" onClick={closeMenu} className="menu-link">
                            ⚙️ Settings
                        </Link>

                        <Link to="/notifications" onClick={closeMenu} className="menu-link">
                            🔔 Notifications
                        </Link>
                    </aside>
                </>
            )}
        </>
    );
}

export default Menu;
