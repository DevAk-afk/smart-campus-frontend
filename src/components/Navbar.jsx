import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/api";

const font = "'Segoe UI', system-ui, sans-serif";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const authPages = ["/login", "/register", "/admin-register"];
  const isAuthPage = authPages.includes(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Poll ban status every 10 seconds for students
  const checkBanStatus = useCallback(async () => {
    if (!user || user.role !== "student") return;
    try {
      const { data } = await getProfile();
      setIsBanned(data.isBanned || false);
    } catch (err) {
      // silently ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "student") return;

    // Check immediately on mount
    checkBanStatus();

    // Then check every 10 seconds
    const interval = setInterval(checkBanStatus, 10000);
    return () => clearInterval(interval);
  }, [user, checkBanStatus]);

  const handleLogout = () => { logout(); navigate("/login"); };

  // Hide "New Complaint" if student is banned
  const links = user?.role === "admin"
    ? [
        { to: "/admin",     label: "📊 Dashboard" },
        { to: "/dashboard", label: "📋 Complaints" },
        { to: "/students",  label: "👥 Students" },
      ]
    : isBanned
      ? [{ to: "/dashboard", label: "📋 My Complaints" }]
      : [
          { to: "/dashboard", label: "📋 My Complaints" },
          { to: "/create",    label: "✏️ New Complaint" },
        ];

  const accent = user?.role === "admin" ? "#f59e0b" : "#38bdf8";
  const gradient = user?.role === "admin"
    ? "linear-gradient(135deg, #f59e0b, #ef4444)"
    : "linear-gradient(135deg, #3b82f6, #06b6d4)";

  const linkStyle = (to, customAccent) => {
    const a = customAccent || accent;
    const active = location.pathname === to;
    return {
      padding: "8px 14px", borderRadius: "8px", textDecoration: "none",
      fontSize: "13px", fontWeight: active ? "600" : "400",
      color: active ? a : "#94a3b8",
      background: active ? `${a}18` : "transparent",
      border: active ? `1px solid ${a}40` : "1px solid transparent",
      transition: "all 0.2s", display: "block",
    };
  };

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(15,23,42,0.97)" : "#0f172a",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 1rem", fontFamily: font,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", maxWidth: "1200px", margin: "0 auto" }}>

          {/* Logo */}
          <Link
            to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", flexShrink: 0,
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              borderRadius: "9px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", fontWeight: "700",
              color: "white", boxShadow: "0 0 16px rgba(59,130,246,0.4)",
            }}>S</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                Smart Campus
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>
                {isAuthPage ? "System" : user?.role === "admin" ? "Admin" : isBanned ? "Suspended" : "Student"}
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
            <style>{`
              @media (max-width: 640px) { .desktop-nav { display: none !important; } .mobile-btn { display: flex !important; } }
              @media (min-width: 641px) { .mobile-btn { display: none !important; } }
            `}</style>

            {isAuthPage && (
              <>
                <Link to="/login" style={linkStyle("/login")}>Sign In</Link>
                <Link to="/register" style={linkStyle("/register")}>🎓 Student</Link>
                <Link to="/admin-register" style={linkStyle("/admin-register", "#f59e0b")}>🛡️ Admin</Link>
              </>
            )}

            {!isAuthPage && user && (
              <>
                {/* Banned indicator pill */}
                {isBanned && user.role === "student" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "20px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ fontSize: "11px", color: "#f87171", fontWeight: "600" }}>Suspended</span>
                  </div>
                )}

                {links.map(({ to, label }) => (
                  <Link key={to} to={to} style={linkStyle(to)}>{label}</Link>
                ))}

                {/* User dropdown */}
                <div ref={dropdownRef} style={{ position: "relative", marginLeft: "8px" }}>
                  <button onClick={() => setShowDropdown(!showDropdown)} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "5px 10px 5px 5px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "24px", cursor: "pointer", fontFamily: font,
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: isBanned && user.role === "student"
                        ? "rgba(239,68,68,0.4)"
                        : gradient,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "white",
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "13px", color: "#cbd5e1", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </span>
                    <span style={{ fontSize: "10px", color: "#475569" }}>▾</span>
                  </button>

                  {showDropdown && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px", padding: "8px", minWidth: "200px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 200,
                    }}>
                      <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "6px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>{user.name}</div>
                        <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{user.email}</div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                          <div style={{ display: "inline-flex", fontSize: "10px", fontWeight: "600", color: accent, background: `${accent}18`, padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>
                            {user.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                          </div>
                          {isBanned && user.role === "student" && (
                            <div style={{ display: "inline-flex", fontSize: "10px", fontWeight: "600", color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                              🚫 Suspended
                            </div>
                          )}
                        </div>
                      </div>

                      <Link to="/profile" onClick={() => setShowDropdown(false)}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", textDecoration: "none", color: "#94a3b8", fontSize: "13px" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f1f5f9"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                        ✏️ Edit Profile
                      </Link>

                      {user.role === "admin" && (
                        <Link to="/students" onClick={() => setShowDropdown(false)}
                          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", textDecoration: "none", color: "#94a3b8", fontSize: "13px" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f1f5f9"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                          👥 Manage Students
                        </Link>
                      )}

                      <button onClick={handleLogout}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", background: "transparent", border: "none", color: "#f87171", fontSize: "13px", cursor: "pointer", fontFamily: font, textAlign: "left" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              display: "none", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
              cursor: "pointer", flexDirection: "column", gap: "4px", padding: "8px",
            }}>
            <span style={{ display: "block", width: "16px", height: "2px", background: showMobileMenu ? "#38bdf8" : "#94a3b8", transition: "all 0.2s", transform: showMobileMenu ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
            <span style={{ display: "block", width: "16px", height: "2px", background: showMobileMenu ? "transparent" : "#94a3b8", transition: "all 0.2s" }} />
            <span style={{ display: "block", width: "16px", height: "2px", background: showMobileMenu ? "#38bdf8" : "#94a3b8", transition: "all 0.2s", transform: showMobileMenu ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px", background: "#0f172a" }}>
            {isAuthPage && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Link to="/login" style={{ ...linkStyle("/login"), textAlign: "center" }}>Sign In</Link>
                <Link to="/register" style={{ ...linkStyle("/register"), textAlign: "center" }}>🎓 Student Register</Link>
                <Link to="/admin-register" style={{ ...linkStyle("/admin-register", "#f59e0b"), textAlign: "center" }}>🛡️ Admin Register</Link>
              </div>
            )}

            {!isAuthPage && user && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", marginBottom: "6px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isBanned && user.role === "student" ? "rgba(239,68,68,0.4)" : gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>{user.name}</div>
                    <div style={{ fontSize: "11px", color: isBanned && user.role === "student" ? "#f87171" : "#475569" }}>
                      {isBanned && user.role === "student" ? "🚫 Account Suspended" : user.email}
                    </div>
                  </div>
                </div>

                {links.map(({ to, label }) => (
                  <Link key={to} to={to} style={{ ...linkStyle(to), padding: "12px 14px" }}>{label}</Link>
                ))}
                <Link to="/profile" style={{ ...linkStyle("/profile"), padding: "12px 14px" }}>✏️ Edit Profile</Link>
                <button onClick={handleLogout} style={{ padding: "12px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
