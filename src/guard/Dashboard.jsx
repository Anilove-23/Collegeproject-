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

export default function GuardDashboard() {
  const [data, setData] = useState([]);

  // Persistent Completed IDs in LocalStorage
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_OUTPASSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("All"); // All / In / Out
  const [typeFilter, setTypeFilter] = useState("All"); // All / Local / Outstation
  const [hostel, setHostel] = useState("All");

  const [processingId, setProcessingId] = useState(null);
  const [remarks, setRemarks] = useState({});

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6;

  /* ================= FETCH INITIAL DATA ================= */
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPLETED_OUTPASSES_KEY, JSON.stringify(completedIds));
  }, [completedIds]);

  async function fetchInitialData() {
    try {
      setLoading(true);
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

      // Strictly Approved outpasses only
      const approvedOnly = rawList.filter((o) => o.outp_status === "Approved");
      setData(approvedOnly);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load gate monitor records");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const handleRemarkChange = (id, value) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  /* ================= GATE ACTION ================= */
  async function handleGateAction(record) {
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

      // APPEND LOG TO PERMANENT LOGS ARRAY IN LOCALSTORAGE
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

      // IF RETURN, REMOVE FROM CARDS COMPLETELY
      if (targetAction === "enter") {
        setData((prev) =>
          prev.filter((item) => (item.id || item.outpass_id) !== outpassId)
        );
        setCompletedIds((prev) => [...prev, outpassId]);
      } else {
        // IF EXIT, MARK AS OUT
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
    } catch (err) {
      console.error(err);
      alert(err.message || `Failed to record ${targetAction}`);
    } finally {
      setProcessingId(null);
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

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6 p-4 sm:p-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6d0f16] tracking-tight">
            Gate Movement Terminal
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time verification for active and approved student outpasses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl px-4 py-2.5 text-center min-w-[110px] shadow-xs">
            <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
              Inside Campus
            </p>
            <p className="text-2xl font-black text-blue-900 mt-0.5">
              {
                data.filter(
                  (d) =>
                    !completedIds.includes(d.id || d.outpass_id) &&
                    (d.std_status === "In" || !d.std_status)
                ).length
              }
            </p>
          </div>
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-2.5 text-center min-w-[110px] shadow-xs">
            <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
              Currently Out
            </p>
            <p className="text-2xl font-black text-amber-900 mt-0.5">
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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* FILTER TOOLBAR */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search student, roll no, room, destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] focus:ring-2 focus:ring-[#6d0f16]/10 transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
          </div>

          <select
            value={hostel}
            onChange={(e) => {
              setHostel(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto border border-gray-200 bg-gray-50/80 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
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

        {/* DUAL FILTERS ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
          {/* Movement Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">
              Status:
            </span>
            {["All", "In", "Out"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  status === s
                    ? "bg-[#6d0f16] text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {s === "In" ? "🏠 Inside" : s === "Out" ? "🚶 Outside" : "All Movement"}
              </button>
            ))}
          </div>

          {/* Outpass Type Filter (Local vs Outstation) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">
              Pass Type:
            </span>
            {["All", "Local", "Outstation"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === t
                    ? "bg-slate-800 text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {t === "Local" ? "📍 Local" : t === "Outstation" ? "✈️ Outstation" : "All Types"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-sm">Loading active gate records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 text-sm font-medium shadow-xs">
          No matching active outpasses found
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedList.map((o) => {
              const targetId = o.id || o.outpass_id;
              const isProcessing = processingId === targetId;
              const isInCampus = o.std_status === "In" || !o.std_status;
              const isOutstation =
                (o.outpass_type || o.type || "").toLowerCase() === "outstation";

              return (
                <div
                  key={targetId}
                  className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* TOP TITLE ROW & BADGES */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">
                          {o.name}
                        </h2>
                        <p className="text-xs font-semibold text-gray-400 truncate mt-0.5">
                          {o.roll_no || "No Roll"} • {o.department || "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isInCampus
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isInCampus ? "🏠 Inside" : "🚶 Outside"}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                            isOutstation
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-teal-50 text-teal-700 border border-teal-200"
                          }`}
                        >
                          {isOutstation ? "✈️ Outstation" : "📍 Local"}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Detail label="Hostel" value={o.hostel} />
                      <Detail label="Room" value={o.room} />
                      <Detail label="Phone" value={o.phone} />
                      <Detail label="Parent Contact" value={o.parent_contact} />
                      <Detail label="Destination" value={o.place_of_visit} />
                      <Detail label="Purpose" value={o.purpose} />
                    </div>

                    {/* TIMESTAMPS */}
                    <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Departure
                        </p>
                        <p className="font-semibold text-gray-800 truncate mt-0.5">
                          {formatDate(o.departure_datetime)}
                        </p>
                      </div>

                      <div className="bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Expected Return
                        </p>
                        <p className="font-semibold text-gray-800 truncate mt-0.5">
                          {formatDate(o.arrival_datetime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* GUARD REMARKS & ACTION */}
                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
                    <input
                      type="text"
                      placeholder="Add guard remark..."
                      value={remarks[targetId] || ""}
                      onChange={(e) => handleRemarkChange(targetId, e.target.value)}
                      className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white focus:border-[#6d0f16] transition"
                    />

                    <button
                      onClick={() => handleGateAction(o)}
                      disabled={isProcessing}
                      className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer ${
                        isInCampus
                          ? "bg-[#6d0f16] hover:bg-[#530b11] text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Recording...</span>
                        </>
                      ) : isInCampus ? (
                        <span>Mark Exit 🚪 ➔</span>
                      ) : (
                        <span>Mark Return & Complete 🏠 ➔</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between text-xs text-gray-500 font-medium">
            <p>
              Page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} passes)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition shadow-xs cursor-pointer"
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition shadow-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="font-semibold text-gray-800 truncate mt-0.5">
        {value || "-"}
      </p>
    </div>
  );
}