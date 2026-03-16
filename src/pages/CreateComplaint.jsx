import React, { useState } from "react";
import { createComplaint } from "../services/api";

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "#1e293b",
  border: "1px solid rgba(99,179,237,0.15)",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#64748b",
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  marginBottom: "8px",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function CreateComplaint() {
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState("");

  const getFocusStyle = (field) => focused === field
    ? { border: "1px solid #38bdf8", boxShadow: "0 0 0 3px rgba(56,189,248,0.12)" }
    : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createComplaint(form);
      setSubmitted(true);
      setForm({ title: "", description: "", category: "", location: "" });
    } catch (err) {
      alert("Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Maintenance", "Cleanliness", "Security", "IT Support", "Hostel", "Canteen", "Other"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: "620px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "20px",
            padding: "6px 14px",
            marginBottom: "16px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8" }} />
            <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "600", letterSpacing: "0.5px" }}>
              NEW COMPLAINT
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            File a Complaint
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Describe your issue and we'll make sure it reaches the right team.
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(16,185,129,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>✓</div>
            <div>
              <div style={{ fontWeight: "600", color: "#10b981", fontSize: "14px" }}>Complaint Submitted!</div>
              <div style={{ color: "#6ee7b7", fontSize: "13px" }}>Our team will review it shortly.</div>
            </div>
            <button onClick={() => setSubmitted(false)} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#10b981", cursor: "pointer", fontSize: "18px", lineHeight: 1,
            }}>×</button>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: "#1e293b",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "32px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          <form onSubmit={handleSubmit}>

            <Field label="Complaint Title">
              <input
                style={{ ...inputStyle, ...getFocusStyle("title") }}
                placeholder="e.g. Broken AC in Room 204"
                value={form.title}
                onFocus={() => setFocused("title")}
                onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                style={{
                  ...inputStyle,
                  ...getFocusStyle("description"),
                  minHeight: "110px",
                  resize: "vertical",
                  lineHeight: "1.6",
                }}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onFocus={() => setFocused("description")}
                onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Category">
                <select
                  style={{ ...inputStyle, ...getFocusStyle("category"), cursor: "pointer" }}
                  value={form.category}
                  onFocus={() => setFocused("category")}
                  onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Location">
                <input
                  style={{ ...inputStyle, ...getFocusStyle("location") }}
                  placeholder="e.g. Block A, Room 101"
                  value={form.location}
                  onFocus={() => setFocused("location")}
                  onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "8px",
                background: loading ? "#1e3a5f" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.35)",
                letterSpacing: "0.3px",
              }}
            >
              {loading ? "Submitting..." : "Submit Complaint →"}
            </button>

          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#334155", marginTop: "20px" }}>
          All complaints are reviewed within 24–48 hours
        </p>
      </div>
    </div>
  );
}

export default CreateComplaint;
