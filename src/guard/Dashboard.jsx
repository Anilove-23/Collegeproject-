import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LOCAL_LOGS_KEY = "guard_gate_audit_logs";
const COMPLETED_OUTPASSES_KEY = "guard_completed_outpasses";
const CACHED_OUTPASSES_KEY = "guard_cached_outpasses";

export default function GuardDashboard() {
  /* ================= PERSISTENT STATES ================= */
  // 1. Data Cache (prevents data loss on page refresh)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(CACHED_OUTPASSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Persistent Completed IDs
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_OUTPASSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => data.length === 0);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("All"); // All / In / Out
  const [typeFilter, setTypeFilter] = useState("All"); // All / Local / Outstation
  const [hostel, setHostel] = useState("All");

  const [processingId, setProcessingId] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [remarks, setRemarks] = useState({});

  /* ================= IN-CARD EXPAND & MULTI-SELECT STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // Accordion toggle per card

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 9;

  /* ================= FETCH INITIAL DATA & SYNC ================= */
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPLETED_OUTPASSES_KEY, JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem(CACHED_OUTPASSES_KEY, JSON.stringify(data));
  }, [data]);

  async function fetchInitialData() {
    try {
      if (data.length === 0) setLoading(true);
      setError("");
      const result = await apiFetch("/api/outpasses/monitor");

      const rawList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.outpasses)
        ? result.data.outpasses
        : Array.isArray(result?.outpasses)
        ? result.outpasses
        : [];

      const approvedOnly = rawList.filter((o) => o.outp_status === "Approved");

      setData(approvedOnly);
      localStorage.setItem(CACHED_OUTPASSES_KEY, JSON.stringify(approvedOnly));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load gate monitor records");
    } finally {
      setLoading(false);
    }
  }

  const handleRemarkChange = (id, value) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  /* ================= MULTI-SELECT HANDLERS ================= */
  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ================= GATE ACTION (SINGLE) ================= */
  async function handleGateAction(record, e) {
    if (e) e.stopPropagation();
    const outpassId = record.id || record.outpass_id;
    const isCurrentlyIn = record.std_status === "In" || !record.std_status;
    const targetAction = isCurrentlyIn ? "exit" : "enter";
    const currentRemark =
      remarks[outpassId] ||
      (isCurrentlyIn ? "Gate exit recorded" : "Returned safely to campus");

    try {
      setProcessingId(outpassId);

      await apiFetch("/api/outpasses/record-entry", {
        method: "POST",
        body: JSON.stringify({
          outpass_id: outpassId,
          action: targetAction,
          gate: "Main Gate",
          remarks: currentRemark,
        }),
      });

      const nowTimestamp = new Date().toISOString();

      const existingLogs = (() => {
        try {
          return JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY)) || [];
        } catch {
          return [];
        }
      })();

      const newAuditLog = {
        id: Date.now(),
        studentName: record.name,
        rollNo: record.roll_no,
        action: targetAction === "exit" ? "EXIT" : "RETURNED",
        time: nowTimestamp,
        remark: currentRemark,
        hostel: record.hostel,
        room: record.room,
        outpassType: record.outpass_type || "Local",
      };

      localStorage.setItem(
        LOCAL_LOGS_KEY,
        JSON.stringify([newAuditLog, ...existingLogs])
      );

      if (targetAction === "enter") {
        setData((prev) =>
          prev.filter((item) => (item.id || item.outpass_id) !== outpassId)
        );
        setCompletedIds((prev) => [...prev, outpassId]);
      } else {
        setData((prev) =>
          prev.map((item) => {
            const itemId = item.id || item.outpass_id;
            if (itemId === outpassId) {
              return { ...item, std_status: "Out" };
            }
            return item;
          })
        );
      }

      setRemarks((prev) => ({ ...prev, [outpassId]: "" }));
      setSelectedIds((prev) => prev.filter((i) => i !== outpassId));
    } catch (err) {
      console.error(err);
      alert(err.message || `Failed to record ${targetAction}`);
    } finally {
      setProcessingId(null);
    }
  }

  /* ================= BATCH GATE ACTION ================= */
  async function handleBulkGateAction(actionType) {
    if (!selectedIds.length) return;
    try {
      setBulkProcessing(true);
      const targets = data.filter((o) => {
        const id = o.id || o.outpass_id;
        const isCurrentlyIn = o.std_status === "In" || !o.std_status;
        const recordTargetAction = isCurrentlyIn ? "exit" : "enter";
        return selectedIds.includes(id) && recordTargetAction === actionType;
      });

      for (const record of targets) {
        await handleGateAction(record, null);
      }
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk processing error", err);
    } finally {
      setBulkProcessing(false);
    }
  }

  /* ================= FILTER & PAGINATE ================= */
  const filtered = useMemo(() => {
    let list = data.filter((o) => !completedIds.includes(o.id || o.outpass_id));

    if (status !== "All") {
      list = list.filter((o) => o.std_status === status);
    }

    if (typeFilter !== "All") {
      list = list.filter((o) => {
        const itemType = (o.outpass_type || o.type || "Local").toLowerCase();
        return itemType === typeFilter.toLowerCase();
      });
    }

    if (hostel !== "All") {
      list = list.filter((o) => o.hostel === hostel);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.roll_no?.toLowerCase().includes(q) ||
          o.room?.toLowerCase().includes(q) ||
          o.hostel?.toLowerCase().includes(q) ||
          o.place_of_visit?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, completedIds, search, status, typeFilter, hostel]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filtered.slice(startIndex, startIndex + limit);
  }, [filtered, page, limit]);

  const toggleSelectAllPage = () => {
    const pageIds = paginatedList.map((o) => o.id || o.outpass_id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-4 p-4 sm:p-6 relative pb-24">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#6d0f16] tracking-tight">
            Gate Terminal
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Real-time movement tracking with persistent local state
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-1.5 text-center min-w-[90px]">
            <p className="text-[9px] font-bold text-blue-700 uppercase">Inside</p>
            <p className="text-lg font-black text-blue-900 leading-tight">
              {
                data.filter(
                  (d) =>
                    !completedIds.includes(d.id || d.outpass_id) &&
                    (d.std_status === "In" || !d.std_status)
                ).length
              }
            </p>
          </div>
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-1.5 text-center min-w-[90px]">
            <p className="text-[9px] font-bold text-amber-700 uppercase">Outside</p>
            <p className="text-lg font-black text-amber-900 leading-tight">
              {
                data.filter(
                  (d) =>
                    !completedIds.includes(d.id || d.outpass_id) &&
                    d.std_status === "Out"
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3 text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* FILTER TOOLBAR */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search student, roll, hostel, destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 pl-9 text-xs outline-none focus:bg-white focus:border-[#6d0f16] transition"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              🔍
            </span>
          </div>

          <select
            value={hostel}
            onChange={(e) => {
              setHostel(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto border border-gray-200 bg-gray-50/80 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:bg-white focus:border-[#6d0f16] cursor-pointer"
          >
            <option value="All">All Hostels</option>
            {[
              ...new Set(
                (Array.isArray(data) ? data : [])
                  .map((o) => o.hostel)
                  .filter(Boolean)
              ),
            ].map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* DUAL FILTERS & SELECT ALL ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={toggleSelectAllPage}
              className="text-xs font-bold text-[#6d0f16] bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              {paginatedList.every((o) =>
                selectedIds.includes(o.id || o.outpass_id)
              ) && paginatedList.length > 0
                ? "Deselect Page"
                : "Select Page"}
            </button>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-gray-400 mr-1">
                Status:
              </span>
              {["All", "In", "Out"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    status === s
                      ? "bg-[#6d0f16] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-gray-400 mr-1">
              Pass Type:
            </span>
            {["All", "Local", "Outstation"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  typeFilter === t
                    ? "bg-slate-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-xs flex flex-col items-center justify-center space-y-2">
          <div className="w-6 h-6 border-3 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-xs">Loading active passes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs font-medium shadow-xs">
          No matching active outpasses found
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedList.map((o) => {
              const targetId = o.id || o.outpass_id;
              const isProcessing = processingId === targetId;
              const isInCampus = o.std_status === "In" || !o.std_status;
              const isOutstation =
                (o.outpass_type || o.type || "").toLowerCase() === "outstation";
              const isSelected = selectedIds.includes(targetId);
              const isExpanded = expandedId === targetId;

              return (
                <div
                  key={targetId}
                  className={`bg-white border rounded-2xl p-3 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? "border-[#6d0f16] ring-1 ring-[#6d0f16]/30 bg-red-50/10"
                      : "border-gray-200/90"
                  }`}
                >
                  {/* TOP ROW: CHECKBOX + COMPACT INFO */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelect(targetId, e)}
                        className="w-4 h-4 accent-[#6d0f16] rounded cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <h2 className="text-xs font-black text-gray-900 truncate">
                          {o.name}
                        </h2>
                        <p className="text-[10px] font-semibold text-gray-400 truncate">
                          {o.roll_no || "No Roll"} • {o.degree_type || "No Degree"} • {o.hostel} ({o.room || "-"})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isInCampus
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isInCampus ? "🏠 In" : "🚶 Out"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          isOutstation
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-teal-50 text-teal-700 border border-teal-200"
                        }`}
                      >
                        {isOutstation ? "Outstation" : "Local"}
                      </span>
                    </div>
                  </div>

                  {/* SUMMARY INFO */}
                  <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 text-[11px] space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400 font-bold">Visit:</span>
                      <span className="font-semibold truncate max-w-[140px]">
                        {o.place_of_visit || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400 font-bold">Return:</span>
                      <span className="font-semibold truncate">
                        {formatDate(o.arrival_datetime)}
                      </span>
                    </div>
                  </div>

                  {/* SLIDE-DOWN DETAILS ACCORDION */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-gray-100 text-[11px] space-y-2 animate-in fade-in zoom-in-95 duration-100">
                      <div className="grid grid-cols-2 gap-1.5">
                        <Detail label="Phone" value={o.phone} />
                        <Detail label="Parent" value={o.parent_contact} />
                        <Detail label="Purpose" value={o.purpose} />
                        <Detail label="Departure" value={formatDate(o.departure_datetime)} />
                      </div>

                      <input
                        type="text"
                        placeholder="Add guard remark..."
                        value={remarks[targetId] || ""}
                        onChange={(e) => handleRemarkChange(targetId, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:border-[#6d0f16]"
                      />
                    </div>
                  )}

                  {/* ACTION BAR: MARK EXIT/RETURN + TOGGLE DETAILS */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={(e) => toggleExpand(targetId, e)}
                      className="px-2 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold text-[10px] transition cursor-pointer shrink-0"
                    >
                      {isExpanded ? "Less ▲" : "Details ▼"}
                    </button>

                    <button
                      onClick={(e) => handleGateAction(o, e)}
                      disabled={isProcessing}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-2xs active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer ${
                        isInCampus
                          ? "bg-[#6d0f16] hover:bg-[#530b11] text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isProcessing ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : isInCampus ? (
                        <span>Mark Exit 🚪</span>
                      ) : (
                        <span>Mark Return 🏠</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex items-center justify-between text-xs text-gray-500 font-medium">
            <p>
              Page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} passes)
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition cursor-pointer"
              >
                Prev
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BAR FOR MULTI-SELECTION */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-40 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 border border-slate-700">
          <span className="text-xs font-bold text-slate-300">
            {selectedIds.length} Selected
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkGateAction("exit")}
              disabled={bulkProcessing}
              className="bg-[#6d0f16] hover:bg-[#530b11] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              Mark Exit 🚪
            </button>
            <button
              onClick={() => handleBulkGateAction("enter")}
              disabled={bulkProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              Mark Return 🏠
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white underline ml-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5">
      <p className="text-[9px] font-bold uppercase text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 truncate mt-0.5">{value || "-"}</p>
    </div>
  );
}   