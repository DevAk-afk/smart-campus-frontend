import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints, deleteComplaint } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";
const BACKEND_URL = "https://smart-campus-backend-ggrp.onrender.com";

const statusCfg = {
  Pending:       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "⏳", message: "Awaiting admin review." },
  "In Progress": { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)",  icon: "⚙️", message: "Admin is working on this." },
  Resolved:      { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅", message: "Your complaint has been resolved!" },
  Rejected:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: "❌", message: "Complaint was rejected by admin." },
};

const catIcons = {
  Maintenance: "🔧", Cleanliness: "🧹", Security: "🔒",
  "IT Support": "💻", Hostel: "🏠", Canteen: "🍽️", Other: "📋",
};

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.Pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "600", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.color, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
}

function DeleteButton({ complaint, onDelete, deleting }) {
  const [confirm, setConfirm] = useState(false);
  const isDeleting = deleting === complaint._id;

  if (confirm) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "5px 10px" }}>
        <span style={{ fontSize: "11px", color: "#f87171" }}>Sure?</span>
        <button onClick={() => { onDelete(complaint._id); setConfirm(false); }} disabled={isDeleting}
          style={{ padding: "3px 10px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "6px", color: "#f87171", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
          {isDeleting ? "..." : "Yes"}
        </button>
        <button onClick={() => setConfirm(false)}
          style={{ padding: "3px 8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#64748b", fontSize: "11px", cursor: "pointer", fontFamily: font }}>
          No
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)} disabled={isDeleting}
      style={{ padding: "5px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "7px", color: "#f87171", fontSize: "11px", fontWeight: "500", cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: "4px" }}>
      🗑️ Delete
    </button>
  );
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try { const { data } = await getComplaints(); setComplaints(data); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    } finally { setDeletingId(null); }
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
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "20px 16px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 3px", letterSpacing: "-0.5px" }}>My Complaints</h1>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              Welcome, <span style={{ color: "#94a3b8", fontWeight: "500" }}>{user?.name}</span> 👋
            </p>
          </div>
          <Link to="/create" style={{ padding: "9px 18px", background: "linear-gradient(135deg, #3b82f6, #06b6d4)", borderRadius: "9px", color: "white", fontSize: "13px", fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap" }}>
            + New Complaint
          </Link>
        </div>

        {/* Update banner */}
        {complaints.some(c => ["Resolved", "Rejected", "In Progress"].includes(c.status)) && (
          <div style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#64748b", alignSelf: "center" }}>Updates:</span>
            {counts.Resolved > 0 && <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>✅ {counts.Resolved} Resolved</span>}
            {counts["In Progress"] > 0 && <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "600" }}>⚙️ {counts["In Progress"]} In Progress</span>}
            {counts.Rejected > 0 && <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>❌ {counts.Rejected} Rejected</span>}
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total",       val: counts.All,              color: "#f1f5f9" },
            { label: "Pending",     val: counts.Pending,          color: "#f59e0b" },
            { label: "In Progress", val: counts["In Progress"],   color: "#38bdf8" },
            { label: "Resolved",    val: counts.Resolved,         color: "#10b981" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "5px" }}>{label}</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 11px", borderRadius: "7px", fontSize: "11px", fontWeight: filter === s ? "600" : "400", cursor: "pointer", border: filter === s ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.07)", background: filter === s ? "rgba(56,189,248,0.1)" : "transparent", color: filter === s ? "#38bdf8" : "#64748b", fontFamily: font, whiteSpace: "nowrap" }}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>
          <input
            style={{ width: "100%", padding: "9px 14px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: font }}
            placeholder="🔍  Search complaints..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", color: "#475569" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
            <div style={{ fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>No complaints found</div>
            <Link to="/create" style={{ fontSize: "13px", color: "#38bdf8", textDecoration: "none" }}>+ File your first complaint</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((c) => {
              const cfg = statusCfg[c.status] || statusCfg.Pending;
              return (
                <div key={c._id} style={{ background: "#1e293b", borderRadius: "12px", border: `1px solid ${c.status === "Resolved" ? "rgba(16,185,129,0.2)" : c.status === "Rejected" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`, padding: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                      {catIcons[c.category] || "📋"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#f1f5f9", lineHeight: 1.3 }}>{c.title}</h3>
                        <StatusBadge status={c.status} />
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                        {c.description.length > 100 ? c.description.slice(0, 100) + "..." : c.description}
                      </p>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#475569" }}>📍 {c.location}</span>
                        <span style={{ fontSize: "11px", color: "#475569" }}>🏷️ {c.category}</span>
                        <span style={{ fontSize: "11px", color: "#475569" }}>📅 {formatDate(c.createdAt)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: cfg.color }}>
                          <span>{cfg.icon}</span>
                          <span>{cfg.message}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                          {c.image && (
                            <a href={`${BACKEND_URL}${c.image}`} target="_blank" rel="noreferrer">
                              <img src={`${BACKEND_URL}${c.image}`} alt="" style={{ width: "32px", height: "32px", borderRadius: "5px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
                            </a>
                          )}
                          <DeleteButton complaint={c} onDelete={handleDelete} deleting={deletingId} />
                        </div>
                      </div>
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
