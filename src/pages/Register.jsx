import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";
const departments = ["Computer Science", "Mechanical", "Civil", "Electrical", "Electronics", "Other"];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "", department: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await registerUser({ ...form, role: "student" });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "12px 16px", background: "#0f172a",
    border: focused === field ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
    boxShadow: focused === field ? "0 0 0 3px rgba(56,189,248,0.1)" : "none",
    borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
    outline: "none", transition: "all 0.2s", boxSizing: "border-box", fontFamily: font,
  });

  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font, padding: "20px",
    }}>
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", margin: "0 auto 16px",
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            borderRadius: "16px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "26px",
            boxShadow: "0 0 30px rgba(59,130,246,0.4)",
          }}>🎓</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "20px", padding: "4px 14px", marginBottom: "12px",
          }}>
            <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "600", letterSpacing: "0.8px" }}>
              STUDENT REGISTRATION
            </span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Create Student Account
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Register to file and track your complaints
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#1e293b", borderRadius: "16px",
          border: "1px solid rgba(56,189,248,0.1)",
          padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}>
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px", padding: "12px 16px", marginBottom: "20px",
              fontSize: "13px", color: "#f87171",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Full Name</label>
              <input required style={inputStyle("name")} placeholder="John Doe"
                value={form.name}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required style={inputStyle("email")} placeholder="you@campus.edu"
                value={form.email}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Roll Number</label>
                <input style={inputStyle("roll")} placeholder="e.g. CS21001"
                  value={form.rollNumber}
                  onFocus={() => setFocused("roll")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={inputStyle("dept")} value={form.department}
                  onFocus={() => setFocused("dept")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Password</label>
              <input type="password" required style={inputStyle("password")} placeholder="Min. 6 characters"
                value={form.password}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: loading ? "#1e3a5f" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
              border: "none", borderRadius: "10px", color: "white",
              fontSize: "14px", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.35)",
              transition: "all 0.2s", fontFamily: font,
            }}>
              {loading ? "Creating account..." : "Create Student Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#475569" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "600" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
