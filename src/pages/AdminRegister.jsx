import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";
const ADMIN_SECRET = "admin@campus2024";

export default function AdminRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.adminCode !== ADMIN_SECRET) { setError("Invalid admin secret code"); return; }
    setLoading(true);
    try {
      const { data } = await registerUser({ name: form.name, email: form.email, password: form.password, role: "admin" });
      login(data); navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const inp = (field) => ({
    width: "100%", padding: "12px 14px", background: "#0f172a",
    border: focused === field ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)",
    boxShadow: focused === field ? "0 0 0 3px rgba(245,158,11,0.1)" : "none",
    borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
    outline: "none", transition: "all 0.2s", boxSizing: "border-box", fontFamily: font,
  });

  const label = { display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "7px" };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "52px", height: "52px", margin: "0 auto 14px", background: "linear-gradient(135deg, #f59e0b, #ef4444)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 0 24px rgba(245,158,11,0.4)" }}>🛡️</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "20px", padding: "4px 12px", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "600", letterSpacing: "0.8px" }}>ADMIN REGISTRATION</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Create Admin Account</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Restricted — requires admin secret code</p>
        </div>

        <div style={{ background: "#1e293b", borderRadius: "16px", border: "1px solid rgba(245,158,11,0.1)", padding: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "11px", marginBottom: "16px", fontSize: "13px", color: "#f87171" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Full Name</label>
              <input required style={inp("name")} placeholder="Admin Name" value={form.name}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Email Address</label>
              <input type="email" required style={inp("email")} placeholder="admin@campus.edu" value={form.email}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Password</label>
              <input type="password" required style={inp("password")} placeholder="Min. 6 characters" value={form.password}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={{ marginBottom: "22px" }}>
              <label style={{ ...label, color: "#f59e0b" }}>Admin Secret Code</label>
              <input type="password" required style={inp("adminCode")} placeholder="Enter secret code" value={form.adminCode}
                onFocus={() => setFocused("adminCode")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, adminCode: e.target.value })} />
              <p style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}>🔒 Contact your administrator for the secret code</p>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "#2d1f00" : "linear-gradient(135deg, #f59e0b, #ef4444)", border: "none", borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 16px rgba(245,158,11,0.3)", transition: "all 0.2s", fontFamily: font }}>
              {loading ? "Creating account..." : "Create Admin Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#475569" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: "600" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
