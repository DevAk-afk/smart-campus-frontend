import React, { useEffect, useState, useCallback } from "react";
import { getAllStudents, banUser, unbanUser } from "../services/api";

const font = "'Segoe UI', system-ui, sans-serif";

function BanModal({ student, onClose, onBan }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#1e293b", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.2)", padding: "28px", width: "100%", maxWidth: "400px", fontFamily: font }}>
        <h3 style={{ color: "#f87171", margin: "0 0 6px", fontSize: "16px" }}>🚫 Ban Student</h3>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px" }}>
          Banning <strong style={{ color: "#f1f5f9" }}>{student.name}</strong> will prevent them from logging in.
        </p>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>
            Reason (optional)
          </label>
          <input
            style={{ width: "100%", padding: "11px 14px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: font }}
            placeholder="e.g. Spam complaints"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => onBan(student._id, reason)} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "9px", color: "#f87171", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
            Confirm Ban
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", color: "#64748b", fontSize: "13px", cursor: "pointer", fontFamily: font }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ student, onClose, onBan, onUnban }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#1e293b", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", padding: "28px", width: "100%", maxWidth: "440px", fontFamily: font }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: student.isBanned ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg, #3b82f6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "white", flexShrink: 0 }}>
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#f1f5f9" }}>{student.name}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{student.email}</div>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {student.isBanned && <span style={{ fontSize: "10px", color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>🚫 BANNED</span>}
              {student.isVerified
                ? <span style={{ fontSize: "10px", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>✓ VERIFIED</span>
                : <span style={{ fontSize: "10px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>⚠ UNVERIFIED</span>
              }
            </div>
          </div>
        </div>

        <div style={{ background: "#0f172a", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
          {[
            { label: "Roll Number", val: student.rollNumber || "—" },
            { label: "Department",  val: student.department || "—" },
            { label: "Joined",      val: new Date(student.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
            student.isBanned ? { label: "Ban Reason", val: student.banReason || "No reason given" } : null,
          ].filter(Boolean).map(({ label, val }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
              <span style={{ fontSize: "12px", color: label === "Ban Reason" ? "#f87171" : "#94a3b8", fontWeight: "500", textAlign: "right", maxWidth: "60%" }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {student.isBanned ? (
            <button onClick={() => { onUnban(student._id); onClose(); }} style={{ flex: 1, padding: "11px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "9px", color: "#10b981", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
              ✓ Unban Student
            </button>
          ) : (
            <button onClick={() => { onClose(); onBan(student); }} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "9px", color: "#f87171", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
              🚫 Ban Student
            </button>
          )}
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", color: "#64748b", fontSize: "13px", cursor: "pointer", fontFamily: font }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [banModal, setBanModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, color = "#10b981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchStudents = useCallback(async () => {
    try { const { data } = await getAllStudents(); setStudents(data); }
    catch (err) { showToast("Failed to load students", "#ef4444"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleBan = async (id, reason) => {
    try {
      await banUser(id, { banReason: reason });
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isBanned: true, banReason: reason } : s));
      showToast("🚫 Student banned successfully", "#ef4444");
    } catch { showToast("Failed to ban student", "#ef4444"); }
    finally { setBanModal(null); }
  };

  const handleUnban = async (id) => {
    try {
      await unbanUser(id);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isBanned: false, banReason: "" } : s));
      showToast("✓ Student unbanned successfully", "#10b981");
    } catch { showToast("Failed to unban student", "#ef4444"); }
  };

  const total = students.length;
  const verified = students.filter(s => s.isVerified).length;
  const banned = students.filter(s => s.isBanned).length;
  const unverified = students.filter(s => !s.isVerified).length;
  const active = Math.max(0, verified - banned);

  const filtered = students
    .filter(s => {
      if (filter === "Banned") return s.isBanned;
      if (filter === "Active") return !s.isBanned && s.isVerified;
      if (filter === "Unverified") return !s.isVerified;
      return true;
    })
    .filter(s =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.department || "").toLowerCase().includes(search.toLowerCase())
    );

  const tabs = [
    { key: "All",        label: `All (${total})` },
    { key: "Active",     label: `Active (${active})` },
    { key: "Banned",     label: `Banned (${banned})` },
    { key: "Unverified", label: `Unverified (${unverified})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: font, padding: "20px 16px", color: "#f1f5f9" }}>

      {banModal && <BanModal student={banModal} onClose={() => setBanModal(null)} onBan={handleBan} />}
      {detailModal && <DetailModal student={detailModal} onClose={() => setDetailModal(null)} onBan={(s) => setBanModal(s)} onUnban={handleUnban} />}

      {toast && (
        <div style={{ position: "fixed", top: "70px", right: "16px", zIndex: 999, background: "#1e293b", border: `1px solid ${toast.color}`, borderRadius: "10px", padding: "10px 18px", color: toast.color, fontSize: "13px", fontWeight: "600", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", maxWidth: "280px" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 3px", letterSpacing: "-0.5px" }}>Student Management</h1>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>View, manage and control student access</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Total",      val: total,      color: "#f1f5f9" },
            { label: "Active",     val: active,     color: "#10b981" },
            { label: "Banned",     val: banned,     color: "#ef4444" },
            { label: "Unverified", val: unverified, color: "#f59e0b" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "5px" }}>{label}</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: filter === key ? "600" : "400", cursor: "pointer", border: filter === key ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.07)", background: filter === key ? "rgba(245,158,11,0.1)" : "transparent", color: filter === key ? "#f59e0b" : "#64748b", fontFamily: font, whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>

        <input
          style={{ width: "100%", padding: "9px 14px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#f1f5f9", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: font, marginBottom: "16px" }}
          placeholder="🔍  Search by name, email, roll number or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#475569" }}>Loading students...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", color: "#475569" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>👥</div>
            <div style={{ fontWeight: "600", color: "#64748b" }}>No students found</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map(s => (
              <div key={s._id} style={{ background: "#1e293b", borderRadius: "12px", border: `1px solid ${s.isBanned ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: s.isBanned ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg, #3b82f6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: s.isBanned ? "#64748b" : "#f1f5f9" }}>{s.name}</span>
                    {s.isBanned && <span style={{ fontSize: "10px", color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "1px 7px", borderRadius: "10px", fontWeight: "600" }}>BANNED</span>}
                    {!s.isVerified && <span style={{ fontSize: "10px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "1px 7px", borderRadius: "10px", fontWeight: "600" }}>UNVERIFIED</span>}
                    {s.isVerified && !s.isBanned && <span style={{ fontSize: "10px", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "1px 7px", borderRadius: "10px", fontWeight: "600" }}>ACTIVE</span>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <span>{s.email}</span>
                    {s.rollNumber && <span>· {s.rollNumber}</span>}
                    {s.department && <span>· {s.department}</span>}
                  </div>
                  {s.isBanned && s.banReason && (
                    <div style={{ fontSize: "11px", color: "#f87171", marginTop: "3px" }}>Reason: {s.banReason}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                  <button onClick={() => setDetailModal(s)} style={{ padding: "6px 12px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "8px", color: "#38bdf8", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
                    👁 View
                  </button>
                  {s.isBanned ? (
                    <button onClick={() => handleUnban(s._id)} style={{ padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", color: "#10b981", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
                      ✓ Unban
                    </button>
                  ) : (
                    <button onClick={() => setBanModal(s)} style={{ padding: "6px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: font }}>
                      🚫 Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "#334155" }}>
            Showing {filtered.length} of {total} students
          </div>
        )}
      </div>
    </div>
  );
}
