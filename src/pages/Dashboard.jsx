import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints, deleteComplaint } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";

const statusCfg = {
  Pending:       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "⏳", message: "Your complaint is awaiting review by admin." },
  "In Progress": { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)",  icon: "⚙️", message: "Admin is working on your complaint." },
  Resolved:      { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅", message: "Your complaint has been resolved!" },
  Rejected:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: "❌", message: "Your complaint was rejected by admin." },
};

const catIcons = {
  Maintenance: "🔧", Cleanliness: "🧹", Security: "🔒",
  "IT Support": "💻", Hostel: "🏠", Canteen: "🍽️", Other: "📋",
};

const BACKEND_URL = "https://smart-campus-backend-ggrp.onrender.com";

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
      fontWeight: "600", color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`, textTransform: "uppercase", letterSpacing: "0.4px",
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {status}
    </span>
  );
}

function StatusInfo({ status }) {
  const cfg = statusCfg[status] || statusCfg.Pending;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      marginTop: "10px", paddingTop: "10px",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      fontSize: "12px", color: cfg.color,
    }}>
      <span>{cfg.icon}</span>
      <span>{cfg.message}</span>
    </div>
  );
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await getComplaints();
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await deleteComplaint(id);
    setComplaints(complaints.filter(c => c._id !== id));
  };

  const statuses = ["All", "Pending", "In Progress", "Resolved", "Rejected"];
  const counts = Object.fromEntries(
    statuses.map(s => [s, s === "All" ? complaints.length : complaints.filter(c => c.status === s).length])
  );

  const filtered = complaints
    .filter(c => filter === "All" || c.status === filter)
    .filter(c => !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "36px 24px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              My Complaints
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Welcome back, <span style={{ color: "#94a3b8", fontWeight: "500" }}>{user?.name}</span> 👋 — track your complaint statuses below
            </p>
          </div>
          <Link to="/create" style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            borderRadius: "10px", color: "white", fontSize: "13px",
            fontWeight: "600", textDecoration: "none",
            boxShadow: "0 0 16px rgba(59,130,246,0.3)",
          }}>+ New Complaint</Link>
        </div>

        {complaints.some(c => c.status === "Resolved" || c.status === "Rejected") && (
          <div style={{
            background: "#1e293b", borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 20px", marginBottom: "20px",
            display: "flex", gap: "20px", flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "12px", color: "#64748b", alignSelf: "center" }}>Recent updates:</span>
            {counts.Resolved > 0 && (
              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: "600" }}>
                ✅ {counts.Resolved} Resolved
              </span>
            )}
            {counts["In Progress"] > 0 && (
              <span style={{ fontSize: "13px", color: "#38bdf8", fontWeight: "600" }}>
                ⚙️ {counts["In Progress"]} In Progress
              </span>
            )}
            {counts.Rejected > 0 && (
              <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: "600" }}>
                ❌ {counts.Rejected} Rejected
              </span>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total", val: counts.All, color: "#f1f5f9" },
            { label: "Pending", val: counts.Pending, color: "#f59e0b" },
            { label: "In Progress", val: counts["In Progress"], color: "#38bdf8" },
            { label: "Resolved", val: counts.Resolved, color: "#10b981" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              background: "#1e293b", borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
              <div style={{ fontSize: "26px", fontWeight: "700", color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: "6px 13px", borderRadius: "8px", fontSize: "12px",
                fontWeight: filter === s ? "600" : "400", cursor: "pointer",
                border: filter === s ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.07)",
                background: filter === s ? "rgba(56,189,248,0.1)" : "transparent",
                color: filter === s ? "#38bdf8" : "#64748b",
                transition: "all 0.15s", fontFamily: font,
              }}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>
          <input
            style={{
              marginLeft: "auto", padding: "8px 14px",
              background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", color: "#f1f5f9", fontSize: "13px",
              outline: "none", width: "190px", fontFamily: font,
            }}
            placeholder="🔍  Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Loading your complaints...</div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "#1e293b", borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.06)", color: "#475569",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>📭</div>
            <div style={{ fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>No complaints found</div>
            <Link to="/create" style={{ fontSize: "13px", color: "#38bdf8", textDecoration: "none" }}>
              + File your first complaint
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((c) => {
              return (
                <div key={c._id} style={{
                  background: "#1e293b", borderRadius: "14px",
                  border: `1px solid ${c.status === "Resolved" ? "rgba(16,185,129,0.2)" : c.status === "Rejected" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                  padding: "18px 22px",
                  transition: "transform 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", flexShrink: 0,
                    }}>
                      {catIcons[c.category] || "📋"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
                          {c.title}
                        </h3>
                        <StatusBadge status={c.status} />
                      </div>

                      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                        {c.description.length > 120 ? c.description.slice(0, 120) + "..." : c.description}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", color: "#475569" }}>📍 {c.location}</span>
                          <span style={{ fontSize: "11px", color: "#475569" }}>🏷️ {c.category}</span>
                          <span style={{ fontSize: "11px", color: "#475569" }}>📅 {formatDate(c.createdAt)}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {c.image && (
                            <a href={`${BACKEND_URL}${c.image}`} target="_blank" rel="noreferrer">
                              <img src={`${BACKEND_URL}${c.image}`} alt=""
                                style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
                            </a>
                          )}
                          {c.status === "Pending" && (
                            <button onClick={() => handleDelete(c._id)} style={{
                              padding: "4px 10px", fontSize: "11px", fontWeight: "500",
                              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                              borderRadius: "6px", color: "#f87171", cursor: "pointer", fontFamily: font,
                            }}>Delete</button>
                          )}
                        </div>
                      </div>

                      <StatusInfo status={c.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}