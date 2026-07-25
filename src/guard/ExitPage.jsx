import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";

export default function ExitPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6; // Cards per page

  /* ================= FETCH ================= */
  async function fetchStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/outpasses/monitor");
      console.log("Exit Page Raw Response:", response);

      // Robust fallback array extraction
      const rawList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.outpasses)
        ? response.data.outpasses
        : Array.isArray(response?.outpasses)
        ? response.outpasses
        : [];

      const filtered = rawList.filter(
        (o) =>
          o.outp_status === "Approved" &&
          o.is_active === true &&
          o.std_status === "In"
      );

      setStudents(filtered);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch student exit data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= SEARCH & PAGINATE ================= */
  const filteredStudents = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const query = search.toLowerCase().trim();

    if (!query) return safeStudents;

    return safeStudents.filter(
      (s) =>
        s.name?.toLowerCase?.()?.includes(query) ||
        s.roll_no?.toLowerCase?.()?.includes(query) ||
        s.department?.toLowerCase?.()?.includes(query) ||
        s.hostel?.toLowerCase?.()?.includes(query)
    );
  }, [students, search]);

  // Pagination Calculations
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const paginatedStudents = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredStudents.slice(startIndex, startIndex + limit);
  }, [filteredStudents, page, limit]);

  // Reset page when search term updates
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /* ================= MARK EXIT ================= */
  async function handleExit(outpassId) {
    try {
      setProcessingId(outpassId);
      console.log("Marking Exit:", outpassId);

      await apiFetch("/api/outpasses/record-entry", {
        method: "POST",
        body: JSON.stringify({
          outpass_id: outpassId,
          action: "exit",
          gate: "Main Gate",
        }),
      });

      await fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to mark exit");
    } finally {
      setProcessingId(null);
    }
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#6d0f16] tracking-tight">
            Exit Students
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Verify approved student credentials prior to campus exit
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-3.5 shadow-sm min-w-[180px] flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Eligible Students
            </p>
            <p className="text-3xl font-extrabold text-[#6d0f16] mt-0.5">
              {filteredStudents.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f8eaea] text-[#6d0f16] flex items-center justify-center text-lg">
            🚪
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by student name, roll number, department..."
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 pl-12 text-sm outline-none focus:border-[#6d0f16] focus:ring-2 focus:ring-[#6d0f16]/10 transition shadow-sm"
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

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-sm">Fetching eligible students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 font-medium shadow-sm">
          No students currently eligible for exit
        </div>
      ) : (
        <div className="space-y-6">
          {/* CARDS GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {paginatedStudents.map((student) => {
              const outpassId = student.outpass_id || student.id;
              const isProcessing = processingId === outpassId;

              return (
                <div
                  key={outpassId}
                  className="bg-white border border-gray-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between"
                >
                  {/* TOP CARD BAR */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#6d0f16] tracking-tight">
                          {student.name}
                        </h2>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
                          {student.roll_no || "No Roll Number"}
                        </p>
                      </div>

                      <span className="bg-green-100 text-green-800 px-3.5 py-1 rounded-full text-xs font-semibold border border-green-200/60 shadow-xs">
                        Approved
                      </span>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                      <Detail label="Department" value={student.department} />
                      <Detail label="Hostel" value={student.hostel} />
                      <Detail label="Room" value={student.room} />
                      <Detail label="Type" value={student.outpass_type} />
                      <Detail label="Place" value={student.place_of_visit} />
                      <Detail label="Purpose" value={student.purpose} />
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() => handleExit(outpassId)}
                    disabled={isProcessing}
                    className="w-full mt-6 bg-[#6d0f16] hover:bg-[#530b11] text-white py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Mark Exit ➔</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} eligible)
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

/* ================= DETAIL COMPONENT ================= */
function Detail({ label, value }) {
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