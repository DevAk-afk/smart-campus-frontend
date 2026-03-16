import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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

            {/* User badge */}
            <div style={{
              marginLeft: "12px", display: "flex", alignItems: "center", gap: "10px",
              padding: "6px 12px 6px 6px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", color: "white",
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "13px", color: "#cbd5e1", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              marginLeft: "8px", padding: "8px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", color: "#f87171",
              fontSize: "13px", fontWeight: "500",
              cursor: "pointer", transition: "all 0.2s", fontFamily: font,
            }}>
              Logout
            </button>
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
