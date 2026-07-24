import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";

export default function ReturnPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [hostel, setHostel] = useState("All");
  const [sort, setSort] = useState("LATEST");
  const [processingId, setProcessingId] = useState(null);

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 5; // Records per page

  /* ================= FETCH ================= */
  async function fetchExitedStudents() {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/api/outpasses/monitor");
      console.log("Return Page Raw Response:", result);

      // Robust fallback array extraction
      const rawList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.outpasses)
        ? result.data.outpasses
        : Array.isArray(result?.outpasses)
        ? result.outpasses
        : [];

      setLogs(rawList);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch outside student logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExitedStudents();
  }, []);

  /* ================= RETURN ACTION ================= */
  async function handleReturn(id) {
    try {
      setProcessingId(id);

      const result = await apiFetch("/api/outpasses/record-entry", {
        method: "POST",
        body: JSON.stringify({
          outpass_id: id,
          action: "enter",
        }),
      });

      console.log(result);
      await fetchExitedStudents();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to record return entry");
    } finally {
      setProcessingId(null);
    }
  }

  /* ================= FILTER & PAGINATE ================= */
  const filtered = useMemo(() => {
    const safeLogs = Array.isArray(logs) ? logs : [];

    let arr = safeLogs.filter((o) => {
      /* ONLY OUTSIDE STUDENTS */
      if (o.std_status !== "Out") {
        return false;
      }

      const q = search.toLowerCase().trim();

      const matchSearch =
        !q ||
        o.name?.toLowerCase().includes(q) ||
        o.roll_no?.toLowerCase().includes(q) ||
        o.room?.toLowerCase().includes(q) ||
        o.department?.toLowerCase().includes(q);

      const matchHostel = hostel === "All" || o.hostel === hostel;

      return matchSearch && matchHostel;
    });

    /* SORT */
    arr.sort((a, b) =>
      sort === "LATEST"
        ? new Date(b.created_at || 0) - new Date(a.created_at || 0)
        : new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );

    return arr;
  }, [logs, search, hostel, sort]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const paginatedLogs = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filtered.slice(startIndex, startIndex + limit);
  }, [filtered, page, limit]);

  // Reset page to 1 when filters or search change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#6d0f16] tracking-tight">
            Return Panel
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Record student arrival and entry verification back to campus
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-3.5 shadow-sm min-w-[180px] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Outside Campus
            </p>
            <p className="text-3xl font-extrabold text-[#6d0f16] mt-0.5">
              {filtered.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold">
            🚶
          </div>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <input
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            placeholder="Search student, roll number, or room..."
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={hostel}
          onChange={(e) => handleFilterChange(setHostel, e.target.value)}
          className="border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
        >
          <option value="All">All Hostels</option>
          {[
            ...new Set(
              (Array.isArray(logs) ? logs : []).map((o) => o.hostel).filter(Boolean)
            ),
          ].map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => handleFilterChange(setSort, e.target.value)}
          className="border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
        >
          <option value="LATEST">Latest First</option>
          <option value="OLDEST">Oldest First</option>
        </select>

        <div className="bg-gray-100 border border-gray-200/60 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600">
          Showing: <span className="text-gray-900 font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-sm font-medium">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-sm">Loading return panel...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 font-medium shadow-sm">
          No outside students found matching the criteria
        </div>
      ) : (
        <div className="space-y-5">
          {/* ================= LIST ================= */}
          <div className="space-y-4">
            {paginatedLogs.map((o) => {
              const targetId = o.id || o.outpass_id;
              const isProcessing = processingId === targetId;

              return (
                <div
                  key={targetId}
                  className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* LEFT CONTENT */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                          {o.name}
                        </h2>

                        <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-semibold border border-orange-200/60">
                          Outside Campus
                        </span>

                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold border border-green-200/60">
                          Approved
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide">
                        {o.roll_no || "No Roll No"} • {o.department || "N/A"}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
                        <Info label="Hostel" value={o.hostel} />
                        <Info label="Room" value={o.room} />
                        <Info label="Phone" value={o.phone} />
                        <Info label="Place" value={o.place_of_visit} />
                        <Info label="Purpose" value={o.purpose} />
                        <Info label="Parent Contact" value={o.parent_contact} />
                      </div>
                    </div>

                    {/* RIGHT ACTION */}
                    <div className="w-full lg:w-auto min-w-[200px]">
                      <button
                        onClick={() => handleReturn(targetId)}
                        disabled={isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-2xl font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Recording...</span>
                          </>
                        ) : (
                          <span>Mark Return ➔</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-xs cursor-pointer"
              >
                Previous
              </button>

              <span className="text-xs font-semibold px-2 text-gray-600">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-xs cursor-pointer"
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

/* ================= INFO COMPONENT ================= */
function Info({ label, value }) {
  return (
    <div className="bg-gray-50/80 border border-gray-200/60 rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="font-semibold text-xs text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  );
}