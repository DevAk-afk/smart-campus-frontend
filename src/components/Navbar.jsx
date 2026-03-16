import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("#user-dropdown")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = user?.role === "admin"
    ? [{ to: "/admin", label: "Analytics" }, { to: "/dashboard", label: "All Complaints" }]
    : [{ to: "/dashboard", label: "My Complaints" }, { to: "/create", label: "New Complaint" }];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(15,23,42,0.97)" : "#0f172a",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(99,179,237,0.12)",
      padding: "0 2rem", display: "flex",
      alignItems: "center", justifyContent: "space-between",
      height: "64px", fontFamily: font,
    }}>
      {/* Logo */}
      <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px", height: "36px",
          background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
          borderRadius: "10px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "18px", fontWeight: "700",
          color: "white", boxShadow: "0 0 20px rgba(59,130,246,0.4)",
        }}>S</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.3px" }}>
            Smart Campus
          </div>
          <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {user?.role === "admin" ? "Admin Panel" : "Student Portal"}
          </div>
        </div>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {user ? (
          <>
            {links.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: "8px 14px", borderRadius: "8px", textDecoration: "none",
                fontSize: "13px",
                fontWeight: location.pathname === to ? "600" : "400",
                color: location.pathname === to ? "#38bdf8" : "#94a3b8",
                background: location.pathname === to ? "rgba(56,189,248,0.1)" : "transparent",
                border: location.pathname === to ? "1px solid rgba(56,189,248,0.2)" : "1px solid transparent",
                transition: "all 0.2s",
              }}>{label}</Link>
            ))}

            {/* User dropdown */}
            <div id="user-dropdown" style={{ position: "relative", marginLeft: "12px" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "6px 12px 6px 6px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "24px", cursor: "pointer", fontFamily: font,
                }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: user.role === "admin"
                    ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                    : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700", color: "white",
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "13px", color: "#cbd5e1", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
                <span style={{ fontSize: "10px", color: "#475569" }}>▾</span>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "8px",
                  minWidth: "180px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  zIndex: 200,
                }}>
                  {/* User info */}
                  <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "6px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>{user.name}</div>
                    <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{user.email}</div>
                    <div style={{
                      display: "inline-flex", marginTop: "6px",
                      fontSize: "10px", fontWeight: "600",
                      color: user.role === "admin" ? "#f59e0b" : "#38bdf8",
                      background: user.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(56,189,248,0.1)",
                      padding: "2px 8px", borderRadius: "10px",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                    }}>
                      {user.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                    </div>
                  </div>

                  {/* Edit Profile */}
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", borderRadius: "8px",
                      textDecoration: "none", color: "#94a3b8",
                      fontSize: "13px", transition: "all 0.15s",
                      background: "transparent",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f1f5f9"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                  >
                    <span>✏️</span> Edit Profile
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", borderRadius: "8px",
                      background: "transparent", border: "none",
                      color: "#f87171", fontSize: "13px",
                      cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: "8px 16px", borderRadius: "8px", textDecoration: "none",
              fontSize: "13px", color: "#94a3b8", transition: "all 0.2s",
            }}>Sign In</Link>
            <Link to="/register" style={{
              padding: "8px 18px",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              borderRadius: "8px", color: "white",
              fontSize: "13px", fontWeight: "600", textDecoration: "none",
              boxShadow: "0 0 16px rgba(59,130,246,0.3)",
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
