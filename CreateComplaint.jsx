import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/api";

const font = "'Segoe UI', system-ui, sans-serif";

const inputStyle = (focused, field) => ({
  width: "100%", padding: "12px 16px",
  background: "#0f172a",
  border: focused === field ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
  boxShadow: focused === field ? "0 0 0 3px rgba(56,189,248,0.1)" : "none",
  borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
  outline: "none", transition: "all 0.2s", boxSizing: "border-box", fontFamily: font,
});

const labelStyle = {
  display: "block", fontSize: "11px", fontWeight: "600",
  color: "#64748b", letterSpacing: "0.8px",
  textTransform: "uppercase", marginBottom: "8px",
};

const categories = ["Maintenance", "Cleanliness", "Security", "IT Support", "Hostel", "Canteen", "Other"];

export default function CreateComplaint() {
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      await createComplaint(fd);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      fontFamily: font, padding: "40px 20px",
    }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "20px", padding: "6px 14px", marginBottom: "14px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8" }} />
            <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "600", letterSpacing: "0.5px" }}>
              NEW COMPLAINT
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            File a Complaint
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Describe your issue in detail — include photos if available.
          </p>
        </div>

        <div style={{
          background: "#1e293b", borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Complaint Title</label>
              <input required style={inputStyle(focused, "title")}
                placeholder="e.g. Broken AC in Room 204"
                value={form.title}
                onFocus={() => setFocused("title")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Description</label>
              <textarea required style={{ ...inputStyle(focused, "desc"), minHeight: "100px", resize: "vertical", lineHeight: "1.6" }}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onFocus={() => setFocused("desc")} onBlur={() => setFocused("")}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Category + Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select required style={inputStyle(focused, "cat")}
                  value={form.category}
                  onFocus={() => setFocused("cat")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="" disabled>Select...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input required style={inputStyle(focused, "loc")}
                  placeholder="e.g. Block A, Room 101"
                  value={form.location}
                  onFocus={() => setFocused("loc")} onBlur={() => setFocused("")}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Attach Photo (optional)</label>
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  handleImage(e.dataTransfer.files[0]);
                }}
                style={{
                  border: dragOver ? "2px dashed #38bdf8" : "2px dashed rgba(255,255,255,0.1)",
                  borderRadius: "12px", padding: "24px",
                  textAlign: "center", cursor: "pointer",
                  background: dragOver ? "rgba(56,189,248,0.05)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.2s",
                }}>
                {preview ? (
                  <div>
                    <img src={preview} alt="preview" style={{
                      maxHeight: "160px", maxWidth: "100%", borderRadius: "8px",
                      marginBottom: "10px", objectFit: "cover",
                    }} />
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                      {image.name} — Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 4px" }}>
                      Drag & drop or click to upload
                    </p>
                    <p style={{ fontSize: "11px", color: "#334155", margin: 0 }}>
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileRef} type="file" accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImage(e.target.files[0])}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: loading ? "#1e3a5f" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
              border: "none", borderRadius: "10px", color: "white",
              fontSize: "15px", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.35)",
              transition: "all 0.2s", fontFamily: font,
            }}>
              {loading ? "Submitting..." : "Submit Complaint →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
