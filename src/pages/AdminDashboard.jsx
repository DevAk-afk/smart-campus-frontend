import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getAnalytics, getComplaints, updateComplaintStatus, deleteComplaint } from "../services/api";
import { useAuth } from "../context/AuthContext";

const font = "'Segoe UI', system-ui, sans-serif";
const BACKEND_URL = "https://smart-campus-backend-ggrp.onrender.com";
const POLL_INTERVAL = 10000;

const STATUS_COLORS = { Pending: "#f59e0b", "In Progress": "#38bdf8", Resolved: "#10b981", Rejected: "#ef4444" };
const CHART_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];

const statusCfg = {
  Pending:       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  "In Progress": { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)" },
  Resolved:      { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  Rejected:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
};
const catIcons = { Maintenance: "🔧", Cleanliness: "🧹", Security: "🔒", "IT Support": "💻", Hostel: "🏠", Canteen: "🍽️", Other: "📋" };

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.Pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "600", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.color, display: "inline-block", flexShrink: 0 }} />{status}
    </span>
  );
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#f1f5f9" }}>
      <div style={{ fontWeight: "600", marginBottom: "4px" }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

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

function StatusActions({ complaint, onUpdate, updating }) {
  const current = complaint.status;
  const isUpdating = updating === complaint._id;
  const actions = [
    { label: "In Progress", status: "In Progress", color: "#38bdf8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.3)", show: current === "Pending" },
    { label: "✓ Resolve", status: "Resolved", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", show: current !== "Resolved" && current !== "Rejected" },
    { label: "✕ Reject", status: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", show: current !== "Rejected" && current !== "Resolved" },
    { label: "↺ Reopen", status: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", show: current === "Resolved" || current === "Rejected" },
  ].filter(a => a.show);

  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: "10px", color: "#475569" }}>Actions:</span>
      {actions.map(({ label, status, color, bg, border }) => (
        <button key={status} disabled={isUpdating} onClick={() => onUpdate(complaint._id, status)}
          style={{ padding: "5px 12px", background: bg, border: `1px solid ${border}`, borderRadius: "7px", color, fontSize: "11px", fontWeight: "600", cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.5 : 1, fontFamily: font }}>
          {isUpdating ? "..." : label}
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
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const prevCountRef = useRef(0);
  const { user } = useAuth();

  const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); };

  const fetchComplaints = useCallback(async (silent = false) => {
    try {
      const { data } = await getComplaints();
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        const diff = data.length - prevCountRef.current;
        setNewCount(diff);
        showToast(`🔔 ${diff} new complaint${diff > 1 ? "s" : ""} received!`, "#38bdf8");
        setTimeout(() => setNewCount(0), 5000);
      }
      prevCountRef.current = data.length;
      setComplaints(data);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const { data } = await getAnalytics(); setAnalytics(data); }
    catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchComplaints(false); fetchAnalytics(); }, [fetchComplaints, fetchAnalytics]);

  useEffect(() => {
    const interval = setInterval(() => { fetchComplaints(true); fetchAnalytics(); }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchComplaints, fetchAnalytics]);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, status);
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      showToast(status === "Resolved" ? "✓ Resolved" : status === "Rejected" ? "✕ Rejected" : status === "In Progress" ? "⟳ In Progress" : "↺ Reopened", STATUS_COLORS[status]);
    } catch { showToast("Failed to update", "#ef4444"); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c._id !== id));
      showToast("🗑️ Complaint deleted", "#64748b");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "#ef4444");
    } finally { setDeletingId(null); }
  };

  const statuses = ["All", "Pending", "In Progress", "Resolved", "Rejected"];
  const counts = Object.fromEntries(statuses.map(s => [s, s === "All" ? complaints.length : complaints.filter(c => c.status === s).length]));
  const filtered = complaints
    .filter(c => filterStatus === "All" || c.status === filterStatus)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.owner?.name?.toLowerCase().includes(search.toLowerCase()));

  const byStatus = analytics?.byStatus?.map(s => ({ name: s._id, value: s.count })) || [];
  const byCategory = analytics?.byCategory?.map(c => ({ name: c._id, value: c.count })) || [];
  const trend = analytics?.recent?.map(r => ({ date: r._id?.slice(5), count: r.count })) || [];
  const formatTime = (date) => date?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (loading) return <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontFamily: font }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "20px 16px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {toast && (
          <div style={{ position: "fixed", top: "70px", right: "16px", zIndex: 999, background: "#1e293b", border: `1px solid ${toast.color}`, borderRadius: "10px", padding: "10px 18px", color: toast.color, fontSize: "13px", fontWeight: "600", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", maxWidth: "280px" }}>
            {toast.msg}
          </div>
        )}

        {/* Header — no logout button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 3px", letterSpacing: "-0.5px" }}>Admin Dashboard</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Welcome, <span style={{ color: "#94a3b8", fontWeight: "500" }}>{user?.name}</span> 🛡️
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "600" }}>LIVE</span>
                {lastUpdated && <span style={{ fontSize: "10px", color: "#334155" }}>· {formatTime(lastUpdated)}</span>}
              </div>
            </div>
          </div>
          {/* Only manual refresh — no logout */}
          <button onClick={() => { fetchComplaints(true); fetchAnalytics(); }}
            style={{ padding: "8px 14px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "8px", color: "#38bdf8", fontSize: "12px", cursor: "pointer", fontFamily: font }}>
            ↻ Refresh
          </button>
        </div>

        {newCount > 0 && (
          <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🔔</span>
            <span style={{ fontSize: "13px", color: "#38bdf8", fontWeight: "600" }}>{newCount} new complaint{newCount > 1 ? "s" : ""} just arrived!</span>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total", val: complaints.length, color: "#f1f5f9" },
            { label: "Pending", val: counts.Pending, color: "#f59e0b" },
            { label: "In Progress", val: counts["In Progress"], color: "#38bdf8" },
            { label: "Resolved", val: counts.Resolved, color: "#10b981" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "5px" }}>{label}</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[{ key: "complaints", label: "📋 Complaints" }, { key: "analytics", label: "📊 Analytics" }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: tab === key ? "600" : "400", cursor: "pointer", border: tab === key ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.07)", background: tab === key ? "rgba(245,158,11,0.1)" : "transparent", color: tab === key ? "#f59e0b" : "#64748b", fontFamily: font }}>
              {label}
            </button>
          ))}
        </div>

        {/* COMPLAINTS TAB */}
        {tab === "complaints" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {statuses.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "5px 11px", borderRadius: "7px", fontSize: "11px", fontWeight: filterStatus === s ? "600" : "400", cursor: "pointer", border: filterStatus === s ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.07)", background: filterStatus === s ? "rgba(245,158,11,0.1)" : "transparent", color: filterStatus === s ? "#f59e0b" : "#64748b", fontFamily: font, whiteSpace: "nowrap" }}>
                    {s} ({counts[s]})
                  </button>
                ))}
              </div>
              <input style={{ width: "100%", padding: "9px 14px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: font }}
                placeholder="🔍  Search by name or title..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", color: "#475569" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
                <div style={{ fontWeight: "600", color: "#64748b" }}>No complaints found</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map(c => (
                  <div key={c._id} style={{ background: "#1e293b", borderRadius: "12px", border: `1px solid ${c.status === "Pending" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`, padding: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                        {catIcons[c.category] || "📋"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                          <div>
                            <h3 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "600", color: "#f1f5f9", lineHeight: 1.3 }}>{c.title}</h3>
                            <div style={{ fontSize: "11px", color: "#475569" }}>
                              By <span style={{ color: "#94a3b8" }}>{c.owner?.name}</span>
                              {c.owner?.rollNumber && <span> · {c.owner.rollNumber}</span>}
                              {c.owner?.department && <span> · {c.owner.department}</span>}
                            </div>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                        <p style={{ margin: "6px 0 8px", fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>{c.description}</p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{ fontSize: "11px", color: "#475569" }}>📍 {c.location}</span>
                          <span style={{ fontSize: "11px", color: "#475569" }}>🏷️ {c.category}</span>
                          <span style={{ fontSize: "11px", color: "#475569" }}>📅 {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          {c.image && <a href={`${BACKEND_URL}${c.image}`} target="_blank" rel="noreferrer"><img src={`${BACKEND_URL}${c.image}`} alt="" style={{ width: "32px", height: "32px", borderRadius: "5px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} /></a>}
                        </div>
                        {/* Actions + Delete */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <StatusActions complaint={c} onUpdate={handleStatusUpdate} updating={updatingId} />
                          <DeleteButton complaint={c} onDelete={handleDelete} deleting={deletingId} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>📈 Complaints Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trend}>
                  <XAxis dataKey="date" stroke="#334155" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="count" name="Complaints" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>🏷️ By Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={byCategory} barSize={24}>
                    <XAxis dataKey="name" stroke="#334155" tick={{ fill: "#64748b", fontSize: 9 }} />
                    <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                      {byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>📊 By Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3}>
                      {byStatus.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                    <Legend formatter={(val) => <span style={{ color: "#94a3b8", fontSize: "11px" }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    </div>
  );
}
