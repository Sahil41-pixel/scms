import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const stored = localStorage.getItem("scms");
  const user   = stored ? JSON.parse(stored).user : null;

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("scms");
    navigate("/login");
  };

  const navLinks = {
    user: [
      { path: "/home",          label: "Dashboard",     icon: "fa-house" },
      { path: "/my-complaints", label: "My Complaints", icon: "fa-list" },
    ],
    admin: [
      { path: "/admin",            label: "Dashboard",      icon: "fa-chart-pie" },
      { path: "/admin/complaints", label: "All Complaints", icon: "fa-inbox" },
      { path: "/admin/users",      label: "Manage Users",   icon: "fa-users" },
    ],
    employee: [
      { path: "/employee",          label: "Dashboard", icon: "fa-chart-bar" },
      { path: "/employee/resolved", label: "Resolved",  icon: "fa-circle-check" },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  const roleGrad = {
    admin:    "linear-gradient(135deg,#ef4444,#dc2626)",
    employee: "linear-gradient(135deg,#10b981,#059669)",
    user:     "linear-gradient(135deg,#6366f1,#8b5cf6)",
  };
  const roleColor = {
    admin: "#ef4444", employee: "#10b981", user: "#818cf8",
  };

  return (
    <>
      <nav className="scms-nav">
        <div className="scms-nav__wrap">

          {/* Brand */}
          <Link to="/" className="scms-nav__brand">
            <div className="scms-nav__brand-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span className="scms-nav__brand-name">SCMS</span>
          </Link>

          {/* Desktop links */}
          <div className="scms-nav__links">
            {links.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`scms-nav__link${location.pathname === l.path ? " scms-nav__link--active" : ""}`}
              >
                <i className={`fa-solid ${l.icon}`}></i>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="scms-nav__right">
            {user ? (
              <>
                <div className="scms-nav__user">
                  <div className="scms-nav__avatar" style={{ background: roleGrad[user.role] }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="scms-nav__user-text">
                    <span className="scms-nav__username">{user.username}</span>
                    <span className="scms-nav__role" style={{ color: roleColor[user.role] }}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button className="scms-nav__logout" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span className="scms-nav__logout-text">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="scms-nav__ghost">Login</Link>
                <Link to="/register" className="scms-nav__primary">Get Started</Link>
              </>
            )}

            <button
              className="scms-nav__burger"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="scms-nav__mobile-drawer">
            {links.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`scms-nav__mobile-link${location.pathname === l.path ? " active" : ""}`}
              >
                <i className={`fa-solid ${l.icon}`}></i>
                {l.label}
              </Link>
            ))}
            {user && (
              <button className="scms-nav__mobile-logout" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            )}
          </div>
          <div className="scms-nav__mobile-overlay" onClick={() => setMobileOpen(false)} />
        </>
      )}
    </>
  );
};

export default Navbar;