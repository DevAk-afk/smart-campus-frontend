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

  const [form, setForm] = useState({ name: "", email: "", rollNumber: "", department: "" });
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const accent = isAdmin ? "#f59e0b" : "#38bdf8";
  const accentBg = isAdmin ? "rgba(245,158,11,0.1)" : "rgba(56,189,248,0.1)";
  const accentBorder = isAdmin ? "rgba(245,158,11,0.2)" : "rgba(56,189,248,0.2)";
  const gradient = isAdmin ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, #3b82f6, #06b6d4)";

  useEffect(() => {
    getProfile().then(({ data }) => {
      setForm({ name: data.name || "", email: data.email || "", rollNumber: data.rollNumber || "", department: data.department || "" });
    }).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg) => { setSuccess(msg); setError(""); setTimeout(() => setSuccess(""), 3000); };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const { data } = await updateProfile({ name: form.name, email: form.email, rollNumber: form.rollNumber, department: form.department });
      const stored = JSON.parse(localStorage.getItem("user"));
      login({ ...stored, name: data.name, email: data.email });
      showSuccess("Profile updated!");
    } catch (err) { setError(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); setError("");
    if (passwords.newPassword !== passwords.confirmPassword) { setError("Passwords do not match"); return; }
    if (passwords.newPassword.length < 6) { setError("Min. 6 characters"); return; }
    setSavingPass(true);
    try {
      await updateProfile({ password: passwords.newPassword });
      setPasswords({ newPassword: "", confirmPassword: "" });
      showSuccess("Password changed!");
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setSavingPass(false); }
  };

  const inp = (field) => ({
    width: "100%", padding: "12px 14px", background: "#0f172a",
    border: focused === field ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.08)",
    boxShadow: focused === field ? `0 0 0 3px ${accentBg}` : "none",
    borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
    outline: "none", transition: "all 0.2s", boxSizing: "border-box", fontFamily: font,
  });

  const label = { display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "7px" };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: font }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "20px 16px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "14px", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "white", boxShadow: `0 0 20px ${accentBg}`, flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: "20px", padding: "3px 10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", color: accent, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{isAdmin ? "🛡️ Admin" : "🎓 Student"}</span>
            </div>
            <h1 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 2px" }}>My Profile</h1>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{user?.email}</p>
          </div>
          <button onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#64748b", fontSize: "12px", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
            ← Back
          </button>
        </div>

        {/* Alerts */}
        {success && <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "9px", padding: "11px 14px", marginBottom: "16px", fontSize: "13px", color: "#10b981" }}>✅ {success}</div>}
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "9px", padding: "11px 14px", marginBottom: "16px", fontSize: "13px", color: "#f87171" }}>{error}</div>}

        {/* Edit Profile */}
        <div style={{ background: "#1e293b", borderRadius: "14px", border: `1px solid ${accentBorder}`, padding: "20px", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8", margin: "0 0 18px" }}>✏️ Edit Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Full Name</label>
              <input required style={inp("name")} placeholder="Your name" value={form.name}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Email</label>
              <input type="email" required style={inp("email")} value={form.email}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {!isAdmin && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={label}>Roll Number</label>
                  <input style={inp("roll")} placeholder="e.g. CS21001" value={form.rollNumber}
                    onFocus={() => setFocused("roll")} onBlur={() => setFocused("")}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Department</label>
                  <select style={inp("dept")} value={form.department}
                    onFocus={() => setFocused("dept")} onBlur={() => setFocused("")}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            )}
            <button type="submit" disabled={saving} style={{ width: "100%", padding: "12px", background: saving ? "#1a2744" : gradient, border: "none", borderRadius: "9px", color: "white", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : `0 0 14px ${accentBg}`, transition: "all 0.2s", fontFamily: font }}>
              {saving ? "Saving..." : "Save Profile →"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={{ background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", padding: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8", margin: "0 0 18px" }}>🔒 Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>New Password</label>
              <input type="password" required style={inp("newPass")} placeholder="Min. 6 characters" value={passwords.newPassword}
                onFocus={() => setFocused("newPass")} onBlur={() => setFocused("")}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={label}>Confirm Password</label>
              <input type="password" required style={inp("confirmPass")} placeholder="Repeat password" value={passwords.confirmPassword}
                onFocus={() => setFocused("confirmPass")} onBlur={() => setFocused("")}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
              {passwords.confirmPassword && (
                <p style={{ fontSize: "11px", marginTop: "5px", color: passwords.newPassword === passwords.confirmPassword ? "#10b981" : "#ef4444" }}>
                  {passwords.newPassword === passwords.confirmPassword ? "✓ Passwords match" : "✕ Do not match"}
                </p>
              )}
            </div>
            <button type="submit" disabled={savingPass} style={{ width: "100%", padding: "12px", background: savingPass ? "#1a2744" : gradient, border: "none", borderRadius: "9px", color: "white", fontSize: "14px", fontWeight: "600", cursor: savingPass ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: font }}>
              {savingPass ? "Updating..." : "Update Password →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
