import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getAnalytics, getComplaints, updateComplaintStatus } from "../services/api";

const font = "'Segoe UI', system-ui, sans-serif";
const BACKEND_URL = "https://smart-campus-backend-ggrp.onrender.com";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#38bdf8",
  Resolved: "#10b981",
  Rejected: "#ef4444",
};

const CHART_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];

const statusCfg = {
  Pending:       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  "In Progress": { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)" },
  Resolved:      { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  Rejected:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
};

const catIcons = {
  Maintenance: "🔧", Cleanliness: "🧹", Security: "🔒",
  "IT Support": "💻", Hostel: "🏠", Canteen: "🍽️", Other: "📋",
};

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

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#f1f5f9",
    }}>
      <div style={{ fontWeight: "600", marginBottom: "4px" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function StatusActions({ complaint, onUpdate, updating }) {
  const current = complaint.status;
  const isUpdating = updating === complaint._id;

  const actions = [
    {
      label: "Mark In Progress", status: "In Progress",
      color: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.3)",
      show: current === "Pending",
    },
    {
      label: "✓ Mark Resolved", status: "Resolved",
      color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)",
      show: current !== "Resolved" && current !== "Rejected",
    },
    {
      label: "✕ Reject", status: "Rejected",
      color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)",
      show: current !== "Rejected" && current !== "Resolved",
    },
    {
      label: "↺ Reopen", status: "Pending",
      color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)",
      show: current === "Resolved" || current === "Rejected",
    },
  ].filter(a => a.show);

  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ fontSize: "11px", color: "#475569", alignSelf: "center", marginRight: "4px" }}>
        Admin actions:
      </span>
      {actions.map(({ label, status, color, bg, border }) => (
        <button key={status} disabled={isUpdating} onClick={() => onUpdate(complaint._id, status)}
          style={{
            padding: "6px 14px", background: bg, border: `1px solid ${border}`,
            borderRadius: "8px", color, fontSize: "12px", fontWeight: "600",
            cursor: isUpdating ? "not-allowed" : "pointer",
            opacity: isUpdating ? 0.5 : 1, transition: "all 0.15s", fontFamily: font,
          }}
          onMouseEnter={e => { if (!isUpdating) e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          {isUpdating ? "Updating..." : label}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("complaints");
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([getAnalytics(), getComplaints()])
      .then(([a, c]) => { setAnalytics(a.data); setComplaints(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, status);
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      showToast(
        status === "Resolved" ? "✓ Complaint marked as Resolved" :
        status === "Rejected" ? "✕ Complaint Rejected" :
        status === "In Progress" ? "⟳ Marked as In Progress" : "↺ Complaint Reopened",
        STATUS_COLORS[status]
      );
    } catch (err) {
      showToast("Failed to update status", "#ef4444");
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ["All", "Pending", "In Progress", "Resolved", "Rejected"];
  const counts = Object.fromEntries(
    statuses.map(s => [s, s === "All" ? complaints.length : complaints.filter(c => c.status === s).length])
  );

  const filtered = complaints
    .filter(c => filterStatus === "All" || c.status === filterStatus)
    .filter(c => !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.owner?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const byStatus = analytics?.byStatus?.map(s => ({ name: s._id, value: s.count })) || [];
  const byCategory = analytics?.byCategory?.map(c => ({ name: c._id, value: c.count })) || [];
  const trend = analytics?.recent?.map(r => ({ date: r._id?.slice(5), count: r.count })) || [];

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: font }}>
      Loading...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "36px 24px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {toast && (
          <div style={{
            position: "fixed", top: "80px", right: "24px", zIndex: 999,
            background: "#1e293b", border: `1px solid ${toast.color}`,
            borderRadius: "10px", padding: "12px 20px",
            color: toast.color, fontSize: "13px", fontWeight: "600",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}>
            {toast.msg}
          </div>
        )}

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Review, resolve, or reject student complaints
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Total", val: total, color: "#f1f5f9" },
            { label: "Pending", val: pending, color: "#f59e0b" },
            { label: "In Progress", val: inProgress, color: "#38bdf8" },
            { label: "Resolved", val: resolved, color: "#10b981" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              background: "#1e293b", borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)", padding: "18px 20px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>{label}</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {[
            { key: "complaints", label: "📋 Manage Complaints" },
            { key: "analytics", label: "📊 Analytics" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "9px 20px", borderRadius: "8px", fontSize: "13px",
              fontWeight: tab === key ? "600" : "400", cursor: "pointer",
              border: tab === key ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.07)",
              background: tab === key ? "rgba(56,189,248,0.1)" : "transparent",
              color: tab === key ? "#38bdf8" : "#64748b",
              transition: "all 0.15s", fontFamily: font,
            }}>{label}</button>
          ))}
        </div>

        {tab === "complaints" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {statuses.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: "6px 13px", borderRadius: "8px", fontSize: "12px",
                    fontWeight: filterStatus === s ? "600" : "400", cursor: "pointer",
                    border: filterStatus === s ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.07)",
                    background: filterStatus === s ? "rgba(56,189,248,0.1)" : "transparent",
                    color: filterStatus === s ? "#38bdf8" : "#64748b",
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
                  outline: "none", width: "200px", fontFamily: font,
                }}
                placeholder="🔍  Search name or title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "#1e293b", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", color: "#475569" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>📭</div>
                <div style={{ fontWeight: "600", color: "#64748b" }}>No complaints found</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filtered.map(c => (
                  <div key={c._id} style={{
                    background: "#1e293b", borderRadius: "14px",
                    border: `1px solid ${c.status === "Pending" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
                    padding: "20px 24px",
                  }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", flexShrink: 0,
                      }}>
                        {catIcons[c.category] || "📋"}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
                          <div>
                            <h3 style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>
                              {c.title}
                            </h3>
                            <div style={{ fontSize: "12px", color: "#475569" }}>
                              Filed by <span style={{ color: "#94a3b8", fontWeight: "500" }}>{c.owner?.name}</span>
                              {c.owner?.rollNumber && <span> · {c.owner.rollNumber}</span>}
                              {c.owner?.department && <span> · {c.owner.department}</span>}
                            </div>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>

                        <p style={{ margin: "8px 0", fontSize: "13px", color: "#64748b", lineHeight: "1.6" }}>
                          {c.description}
                        </p>

                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#475569" }}>📍 {c.location}</span>
                          <span style={{ fontSize: "12px", color: "#475569" }}>🏷️ {c.category}</span>
                          <span style={{ fontSize: "12px", color: "#475569" }}>
                            📅 {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {c.image && (
                            <a href={`${BACKEND_URL}${c.image}`} target="_blank" rel="noreferrer">
                              <img src={`${BACKEND_URL}${c.image}`} alt="attachment"
                                style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <StatusActions complaint={c} onUpdate={handleStatusUpdate} updating={updatingId} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div style={{ background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>
                📈 Complaints Over Time (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <XAxis dataKey="date" stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={customTooltip} />
                  <Line type="monotone" dataKey="count" name="Complaints" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>🏷️ By Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byCategory} barSize={28}>
                    <XAxis dataKey="name" stroke="#334155" tick={{ fill: "#64748b", fontSize: 10 }} />
                    <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={customTooltip} />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                      {byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", padding: "24px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>📊 By Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                      {byStatus.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={customTooltip} />
                    <Legend formatter={(val) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}