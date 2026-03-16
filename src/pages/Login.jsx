import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const inp = (field) => ({
    width: "100%", padding: "13px 16px", background: "#1e293b",
    border: focused === field ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
    boxShadow: focused === field ? "0 0 0 3px rgba(56,189,248,0.1)" : "none",
    borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
    outline: "none", transition: "all 0.2s", boxSizing: "border-box", fontFamily: font,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "52px", height: "52px", margin: "0 auto 14px", background: "linear-gradient(135deg, #3b82f6, #06b6d4)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "white", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>S</div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Smart Campus System</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Sign in to your account</p>
        </div>

        <div style={{ background: "#1e293b", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "12px", marginBottom: "18px", fontSize: "13px", color: "#f87171" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>Email</label>
              <input type="email" required style={inp("email")} placeholder="you@campus.edu" value={form.email}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>Password</label>
              <input type="password" required style={inp("password")} placeholder="••••••••" value={form.password}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "#1e3a5f" : "linear-gradient(135deg, #3b82f6, #06b6d4)", border: "none", borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 16px rgba(59,130,246,0.3)", transition: "all 0.2s", fontFamily: font }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "12px", color: "#475569", textAlign: "center", marginBottom: "12px" }}>Don't have an account? Register as:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Link to="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "10px", color: "#38bdf8", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                🎓 Student
              </Link>
              <Link to="/admin-register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", color: "#f59e0b", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                🛡️ Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
