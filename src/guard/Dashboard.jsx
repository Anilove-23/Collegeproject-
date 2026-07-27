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

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("All"); // In / Out
  const [approval, setApproval] = useState("All"); // Approved / Pending / Rejected
  const [sort, setSort] = useState("LATEST");

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6; // Records per page

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");
      const result = await apiFetch("/api/outpasses/monitor");
      
      console.log("Monitor API Result:", result);

      // Robust check for different API response shapes
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.outpasses)
        ? result.data.outpasses
        : Array.isArray(result?.outpasses)
        ? result.outpasses
        : [];

      setData(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch dashboard records");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= FILTER & PAGINATE ================= */

  const filtered = useMemo(() => {
    // Ensure list is strictly an array before spreading or filtering
    let list = Array.isArray(data) ? [...data] : [];

    // In / Out Filter
    if (status !== "All") {
      list = list.filter((o) => o.std_status === status);
    }

    // Approved / Pending / Rejected Filter
    if (approval !== "All") {
      list = list.filter((o) => o.outp_status === approval);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.roll_no?.toLowerCase().includes(q) ||
          o.room?.toLowerCase().includes(q) ||
          o.hostel?.toLowerCase().includes(q) ||
          o.department?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sort === "LATEST"
        ? new Date(b.created_at || 0) - new Date(a.created_at || 0)
        : new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );

    return list;
  }, [data, search, status, approval, sort]);

  // Dynamic Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filtered.slice(startIndex, startIndex + limit);
  }, [filtered, page, limit]);

  // Reset page when switching filters
  const handleStatusChange = (s) => {
    setStatus(s);
    setPage(1);
  };

  const handleApprovalChange = (s) => {
    setApproval(s);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#6d0f16] tracking-tight">
            Guard Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Monitor real-time student movement and active outpass verifications
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-3.5 shadow-sm min-w-[170px] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Total Records
            </p>
            <p className="text-3xl font-extrabold text-[#6d0f16] mt-0.5">
              {filtered.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f8eaea] text-[#6d0f16] flex items-center justify-center text-lg font-bold">
            📊
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-sm font-medium">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* ================= FILTERS CONTAINER ================= */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
        {/* SEARCH INPUT */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search student, room, roll number, hostel..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-3.5 pl-12 text-sm outline-none focus:bg-white focus:border-[#6d0f16] focus:ring-2 focus:ring-[#6d0f16]/10 transition"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
            🔍
          </span>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          {/* Movement Status Filter */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Student Movement Status
            </p>
            <div className="flex flex-wrap gap-2">
              {["All", "In", "Out"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    status === s
                      ? "bg-[#6d0f16] text-white shadow-sm"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Outpass Status Filter */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Outpass Status
            </p>
            <div className="flex flex-wrap gap-2">
              {["All", "Approved", "Pending", "Rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleApprovalChange(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    approval === s
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOADING STATE ================= */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-sm">Loading dashboard logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 font-medium shadow-sm">
          No records found matching criteria
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================= CARDS LIST ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedList.map((o) => (
              <div
                key={o.id || o.outpass_id}
                className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        {o.name}
                      </h2>
                      <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
                        {o.roll_no || "No Roll No"} • {o.department || "N/A"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${
                          o.std_status === "In"
                            ? "bg-blue-50 text-blue-700 border-blue-200/60"
                            : "bg-orange-50 text-orange-700 border-orange-200/60"
                        }`}
                      >
                        {o.std_status || "In"}
                      </span>

                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${
                          o.outp_status === "Approved"
                            ? "bg-green-50 text-green-700 border-green-200/60"
                            : o.outp_status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200/60"
                            : "bg-red-50 text-red-700 border-red-200/60"
                        }`}
                      >
                        {o.outp_status}
                      </span>
                    </div>
                  </div>

                  {/* HOSTEL & ROOM */}
                  <div className="flex gap-4 mt-4 text-xs font-semibold text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <span>🏢 Hostel: <strong className="text-gray-800">{o.hostel || "-"}</strong></span>
                    <span>🚪 Room: <strong className="text-gray-800">{o.room || "-"}</strong></span>
                  </div>
                </div>

                {/* TIMESTAMPS */}
                <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      Departure Time
                    </p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(o.departure_datetime)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      Expected Arrival
                    </p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(o.arrival_datetime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION CONTROLS ================= */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} records total)
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-xs"
              >
                Previous
              </button>

              <span className="text-xs font-semibold px-2 text-gray-600">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-xs"
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