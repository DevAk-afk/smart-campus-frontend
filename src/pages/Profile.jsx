import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";

const departments = ["Computer Science", "Mechanical", "Civil", "Electrical", "Electronics", "Other"];

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({
    name: "", email: "", rollNumber: "", department: "",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    getProfile().then(({ data }) => {
      setForm(f => ({
        ...f,
        name: data.name || "",
        email: data.email || "",
        rollNumber: data.rollNumber || "",
        department: data.department || "",
      }));
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const { data } = await updateProfile({
        name: form.name,
        email: form.email,
        rollNumber: form.rollNumber,
        department: form.department,
      });
      // Update stored user
      const stored = JSON.parse(localStorage.getItem("user"));
      login({ ...stored, name: data.name, email: data.email });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ password: form.newPassword });
      setSuccess("Password changed successfully!");
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  const accentColor = isAdmin ? "#f59e0b" : "#38bdf8";
  const accentBg = isAdmin ? "rgba(245,158,11,0.1)" : "rgba(56,189,248,0.1)";
  const accentBorder = isAdmin ? "rgba(245,158,11,0.2)" : "rgba(56,189,248,0.2)";
  const gradient = isAdmin ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, #3b82f6, #06b6d4)";

  const inputStyle = (field) => ({
    width: "100%", padding: "12px 16px",
    background: "#0f172a",
    border: focused === field ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.08)",
    boxShadow: focused === field ? `0 0 0 3px ${accentBg}` : "none",
    borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
    outline: "none", transition: "all 0.2s", boxSizing: "border-box", fontFamily: font,
  });

  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: "#64748b", letterSpacing: "0.8px",
    textTransform: "uppercase", marginBottom: "8px",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: font }}>
      Loading profile...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "40px 20px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
          {/* Avatar */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", fontWeight: "700", color: "white",
            boxShadow: `0 0 24px ${accentBg}`,
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: accentBg, border: `1px solid ${accentBorder}`,
              borderRadius: "20px", padding: "3px 10px", marginBottom: "6px",
            }}>
              <span style={{ fontSize: "10px", color: accentColor, fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {isAdmin ? "🛡️ Admin" : "🎓 Student"}
              </span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 2px", letterSpacing: "-0.5px" }}>
              {user?.name}
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{user?.email}</p>
          </div>
          <button onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
            style={{
              marginLeft: "auto", padding: "8px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", color: "#64748b",
              fontSize: "13px", cursor: "pointer", fontFamily: font,
            }}>
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {["profile", "password"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              style={{
                padding: "9px 20px", borderRadius: "8px", fontSize: "13px",
                fontWeight: tab === t ? "600" : "400", cursor: "pointer",
                border: tab === t ? `1px solid ${accentBorder}` : "1px solid rgba(255,255,255,0.07)",
                background: tab === t ? accentBg : "transparent",
                color: tab === t ? accentColor : "#64748b",
                transition: "all 0.15s", fontFamily: font, textTransform: "capitalize",
              }}>
              {t === "profile" ? "👤 Edit Profile" : "🔒 Change Password"}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
            fontSize: "13px", color: "#10b981", display: "flex", alignItems: "center", gap: "8px",
          }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
            fontSize: "13px", color: "#f87171",
          }}>
            {error}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: "#1e293b", borderRadius: "16px",
          border: `1px solid ${accentBorder}`,
          padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Full Name</label>
                <input required style={inputStyle("name")} placeholder="Your full name"
                  value={form.name}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" required style={inputStyle("email")} placeholder="your@email.com"
                  value={form.email}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              {/* Student-only fields */}
              {!isAdmin && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                  <div>
                    <label style={labelStyle}>Roll Number</label>
                    <input style={inputStyle("roll")} placeholder="e.g. CS21B001"
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
              )}

              {/* Role badge - read only */}
              <div style={{
                marginBottom: "24px", padding: "12px 16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "12px", color: "#475569" }}>Account Type</span>
                <span style={{
                  fontSize: "12px", fontWeight: "600", color: accentColor,
                  background: accentBg, padding: "3px 10px", borderRadius: "20px",
                  border: `1px solid ${accentBorder}`,
                }}>
                  {isAdmin ? "🛡️ Administrator" : "🎓 Student"}
                </span>
              </div>

              <button type="submit" disabled={saving} style={{
                width: "100%", padding: "13px",
                background: saving ? "#1a2744" : gradient,
                border: "none", borderRadius: "10px", color: "white",
                fontSize: "14px", fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : `0 0 20px ${accentBg}`,
                transition: "all 0.2s", fontFamily: font,
              }}>
                {saving ? "Saving..." : "Save Profile Changes →"}
              </button>
            </form>
          )}

          {/* ── PASSWORD TAB ── */}
          {tab === "password" && (
            <form onSubmit={handleChangePassword}>
              <div style={{
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.15)",
                borderRadius: "10px", padding: "12px 16px",
                marginBottom: "24px", fontSize: "12px", color: "#94a3b8",
              }}>
                🔒 Choose a strong password with at least 6 characters
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>New Password</label>
                <input type="password" required style={inputStyle("newPass")}
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onFocus={() => setFocused("newPass")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" required style={inputStyle("confirmPass")}
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onFocus={() => setFocused("confirmPass")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                {/* Password match indicator */}
                {form.confirmPassword && (
                  <p style={{
                    fontSize: "11px", marginTop: "6px",
                    color: form.newPassword === form.confirmPassword ? "#10b981" : "#ef4444",
                  }}>
                    {form.newPassword === form.confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                  </p>
                )}
              </div>

              <button type="submit" disabled={saving} style={{
                width: "100%", padding: "13px",
                background: saving ? "#1a2744" : gradient,
                border: "none", borderRadius: "10px", color: "white",
                fontSize: "14px", fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : `0 0 20px ${accentBg}`,
                transition: "all 0.2s", fontFamily: font,
              }}>
                {saving ? "Updating..." : "Update Password →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
