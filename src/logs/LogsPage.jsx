import React, { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "../utils/api";

const LOG_TYPES = [
  { id: "ALL", label: "All Logs", icon: "📋" },
  { id: "VISIT", label: "Gate Visits", icon: "🚪" },
  { id: "ACTIVITY", label: "Student Activity", icon: "👤" },
  { id: "COMPLAINT", label: "Complaints", icon: "⚠️" },
  { id: "AUDIT", label: "Admin Audit", icon: "🛡️" },
  { id: "AUTH", label: "Auth Logs", icon: "🔑" },
];

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LogsPage() {
  /* ─── State ──────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState("ALL");
  const [hostelFilter, setHostelFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [hostelsList, setHostelsList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  /* ─── Fetch Hostels for Dropdown ────────────────────────── */
  useEffect(() => {
    async function loadHostels() {
      try {
        const res = await apiFetch("/api/hostels");
        const list = Array.isArray(res) ? res : res?.data || res?.hostels || [];
        const names = list.map((h) => typeof h === "string" ? h : h.name).filter(Boolean);
        if (names.length > 0) {
          setHostelsList([...new Set(names)]);
        }
      } catch {
        // Fallback default list if endpoint fails
        setHostelsList(["Dhauladhar Boys Hostel", "Parvati Girls Hostel", "Hostel A", "Hostel B"]);
      }
    }
    loadHostels();
  }, []);

  /* ─── Fetch Logs Function ────────────────────────────────── */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", page);
      queryParams.set("limit", limit);
      if (hostelFilter !== "All") queryParams.set("hostel", hostelFilter);
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());
      if (fromDate) queryParams.set("from", new Date(fromDate).toISOString());
      if (toDate) queryParams.set("to", new Date(toDate).toISOString());

      let endpoint = "/api/logs/visits";
      if (activeTab === "ACTIVITY") {
        endpoint = "/api/logs/activity";
      } else if (activeTab === "AUDIT") {
        endpoint = "/api/logs/audit";
      } else if (activeTab === "AUTH") {
        endpoint = "/api/logs/auth";
      } else if (activeTab === "COMPLAINT") {
        endpoint = "/api/logs/activity";
        queryParams.set("action", "COMPLAINT_CREATED");
      }

      if (activeTab === "ALL") {
        // Parallel fetch for ALL tab
        const [visitsRes, activityRes, auditRes, authRes] = await Promise.allSettled([
          apiFetch(`/api/logs/visits?${queryParams.toString()}`),
          apiFetch(`/api/logs/activity?${queryParams.toString()}`),
          apiFetch(`/api/logs/audit?${queryParams.toString()}`),
          apiFetch(`/api/logs/auth?${queryParams.toString()}`),
        ]);

        let combined = [];

        if (visitsRes.status === "fulfilled") {
          const raw = visitsRes.value?.data?.visits || visitsRes.value?.visits || [];
          combined.push(...raw.map((v) => ({ ...v, logCategory: "VISIT" })));
        }
        if (activityRes.status === "fulfilled") {
          const raw = activityRes.value?.data?.activities || activityRes.value?.activities || [];
          combined.push(...raw.map((a) => ({ ...a, logCategory: a.action === "COMPLAINT_CREATED" ? "COMPLAINT" : "ACTIVITY" })));
        }
        if (auditRes.status === "fulfilled") {
          const raw = auditRes.value?.data?.audits || auditRes.value?.audits || [];
          combined.push(...raw.map((au) => ({ ...au, logCategory: "AUDIT" })));
        }
        if (authRes.status === "fulfilled") {
          const raw = authRes.value?.data?.logs || authRes.value?.logs || [];
          combined.push(...raw.map((a) => ({ ...a, logCategory: "AUTH" })));
        }

        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setLogs(combined.slice(0, limit));
        setTotal(combined.length);
      } else {
        const res = await apiFetch(`${endpoint}?${queryParams.toString()}`);
        const dataPayload = res?.data || res;

        if (activeTab === "VISIT") {
          setLogs((dataPayload.visits || []).map((v) => ({ ...v, logCategory: "VISIT" })));
          setTotal(dataPayload.pagination?.total || 0);
        } else if (activeTab === "AUDIT") {
          setLogs((dataPayload.audits || []).map((a) => ({ ...a, logCategory: "AUDIT" })));
          setTotal(dataPayload.pagination?.total || 0);
        } else if (activeTab === "AUTH") {
          setLogs((dataPayload.logs || []).map((a) => ({ ...a, logCategory: "AUTH" })));
          setTotal(dataPayload.pagination?.total || 0);
        } else {
          setLogs((dataPayload.activities || []).map((a) => ({ ...a, logCategory: activeTab })));
          setTotal(dataPayload.pagination?.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
      setError(err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [activeTab, hostelFilter, searchQuery, fromDate, toDate, page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handleClearFilters = () => {
    setActiveTab("ALL");
    setHostelFilter("All");
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#6d0f16] tracking-tight">
              System Audit & Logs
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
              View student activities, gate movements, complaints, and admin audits across hostels.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span> Refresh
          </button>
        </div>

        {/* ─── LOG TYPE TABS ────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {LOG_TYPES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-2xs ${
                activeTab === tab.id
                  ? "bg-[#6d0f16] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── FILTERS PANEL ──────────────────────────────── */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Student, roll, remark, action..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pl-9 text-xs outline-none focus:bg-white focus:border-[#6d0f16] transition font-medium"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              </div>
            </div>

            {/* Hostel Dropdown */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                Hostel
              </label>
              <select
                value={hostelFilter}
                onChange={(e) => {
                  setHostelFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
              >
                <option value="All">All Hostels</option>
                {hostelsList.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                From Date / Time
              </label>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                To Date / Time
              </label>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition"
              />
            </div>
          </div>

          {/* Active Filter Indicators & Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase">Filters:</span>
              {hostelFilter !== "All" && (
                <span className="bg-red-50 text-[#6d0f16] border border-red-200 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                  Hostel: {hostelFilter}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                  Search: "{searchQuery}"
                </span>
              )}
              {(fromDate || toDate) && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                  Date Range Active
                </span>
              )}
              {hostelFilter === "All" && !searchQuery.trim() && !fromDate && !toDate && (
                <span className="text-gray-400 italic text-[11px]">None active</span>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-gray-500 hover:text-red-700 underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* ─── ERROR ALERT ────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* ─── DATA TABLE ─────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#6d0f16] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading system logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs font-medium space-y-2">
              <p className="text-2xl">📭</p>
              <p>No log records match your selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Actor / Student</th>
                    <th className="py-3.5 px-4">Hostel</th>
                    <th className="py-3.5 px-4">Action / Summary</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {logs.map((log) => {
                    const id = log.id;
                    const isExpanded = expandedId === id;
                    const cat = log.logCategory || activeTab;

                    return (
                      <React.Fragment key={id}>
                        <tr className="hover:bg-gray-50/80 transition-colors">
                          {/* Timestamp */}
                          <td className="py-3 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                            {formatDate(log.created_at || log.actual_departure)}
                          </td>

                          {/* Category Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <CategoryBadge category={cat} action={log.action} />
                          </td>

                          {/* Actor/Student */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-gray-900">
                              {log.student_name || log.staff_name || log.name || (cat === "AUTH" && !log.actor_id ? "Unknown User" : "System")}
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold">
                              {log.roll_no ? `Roll: ${log.roll_no}` : log.staff_email || log.user_email || log.actor_role || "-"}
                            </p>
                          </td>

                          {/* Hostel */}
                          <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-700">
                            {log.hostel || log.staff_hostel || "-"}
                          </td>

                          {/* Summary */}
                          <td className="py-3 px-4">
                            {cat === "VISIT" && (
                              <p className="text-gray-800 font-semibold">
                                Gate: <span className="font-bold">{log.gate || "Main Gate"}</span> ({log.outpass_type || "Outpass"})
                                {log.remarks && <span className="text-gray-500 text-[11px] block mt-0.5">"{log.remarks}"</span>}
                              </p>
                            )}
                            {cat === "AUDIT" && (
                              <p className="text-gray-800 font-semibold">
                                <span className="font-extrabold uppercase text-[#6d0f16]">{log.action}</span> on table{" "}
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono">{log.table_name}</code>
                              </p>
                            )}
                            {(cat === "ACTIVITY" || cat === "COMPLAINT") && (
                              <p className="text-gray-800 font-semibold">
                                <span className="font-bold text-slate-800">{log.action}</span>
                                {log.entity_type && <span className="text-gray-400 text-[10px]"> ({log.entity_type})</span>}
                              </p>
                            )}
                            {cat === "AUTH" && (
                              <p className="text-gray-800 font-semibold">
                                <span className={`font-bold ${log.success ? "text-green-700" : "text-red-700"}`}>{log.action}</span>
                                {log.event_name && <span className="text-gray-500 text-[10px] ml-1">({log.event_name})</span>}
                              </p>
                            )}
                          </td>

                          {/* Expand Button */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : id)}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold text-[10px] transition cursor-pointer"
                            >
                              {isExpanded ? "Hide ▲" : "View ▼"}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED ROW */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-gray-200">
                            <td colSpan={6} className="p-4 text-xs">
                              <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 font-mono text-[11px] text-gray-700 overflow-x-auto shadow-inner">
                                <p className="font-sans font-bold text-[10px] uppercase text-gray-400">
                                  Raw Event Payload / Metadata
                                </p>
                                <pre className="whitespace-pre-wrap break-all">
                                  {JSON.stringify(log.metadata || log.old_values || log.new_values || log, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── PAGINATION BAR ─────────────────────────────── */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-500 font-medium">
            <p>
              Page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({total} total records)
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CategoryBadge({ category, action }) {
  if (category === "VISIT") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
        Gate Visit
      </span>
    );
  }
  if (category === "COMPLAINT") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
        Complaint
      </span>
    );
  }
  if (category === "AUDIT") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
        Admin Audit
      </span>
    );
  }
  if (category === "AUTH") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Auth Log
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
      Activity
    </span>
  );
}
