import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditLog {
  id: number;
  studentName: string;
  rollNo?: string;
  action: "EXIT" | "RETURNED" | string;
  time: string;
  remark?: string;
  hostel?: string;
  room?: string;
  outpassType?: string;
}

function formatDate(date?: string) {
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

export default function GateLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All"); // All / EXIT / RETURNED
  const [typeFilter, setTypeFilter] = useState("All"); // All / Local / Outstation
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    loadLogs();
  }, []);

  function loadLogs() {
    try {
      const saved = localStorage.getItem(LOCAL_LOGS_KEY);
      setLogs(saved ? JSON.parse(saved) : []);
    } catch {
      setLogs([]);
    }
  }

  function handleClearLogs() {
    if (window.confirm("Are you sure you want to clear all movement logs?")) {
      localStorage.removeItem(LOCAL_LOGS_KEY);
      localStorage.removeItem(COMPLETED_OUTPASSES_KEY);
      setLogs([]);
      setPage(1);
    }
  }

  /* ================= FILTER LOGIC ================= */
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. SEARCH FILTER
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.studentName?.toLowerCase().includes(q) ||
        log.rollNo?.toLowerCase().includes(q) ||
        log.hostel?.toLowerCase().includes(q) ||
        log.remark?.toLowerCase().includes(q);

      // 2. ACTION FILTER (EXIT vs RETURNED)
      const matchesAction =
        actionFilter === "All" || log.action?.toUpperCase() === actionFilter.toUpperCase();

      // 3. TYPE FILTER (Local vs Outstation)
      const matchesType =
        typeFilter === "All" ||
        (log.outpassType || "Local").toLowerCase() === typeFilter.toLowerCase();

      // 4. DATE FILTER
      const matchesDate =
        !selectedDate || (log.time && log.time.startsWith(selectedDate));

      return matchesSearch && matchesAction && matchesType && matchesDate;
    });
  }, [logs, search, actionFilter, typeFilter, selectedDate]);

  /* ================= PAGINATION CALCULATIONS ================= */
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLogs.slice(start, start + limit);
  }, [filteredLogs, page, limit]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, val: any) => {
    setter(val);
    setPage(1);
  };

  /* ================= DOWNLOAD PDF REPORT ================= */
  const downloadPDFReport = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.setTextColor(109, 15, 22);
    doc.text("Gate Movement Audit Logs Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateText = selectedDate || "All Dates";
    doc.text(`Filter Date: ${dateText} | Total Records: ${filteredLogs.length}`, 14, 22);

    const tableHeaders = [
      ["Student Name", "Roll No", "Hostel / Room", "Action", "Pass Type", "Guard Remark", "Timestamp"],
    ];

    const tableRows = filteredLogs.map((log) => [
      log.studentName || "-",
      log.rollNo || "-",
      `${log.hostel || "-"}${log.room ? ` / ${log.room}` : ""}`,
      log.action || "-",
      log.outpassType || "Local",
      log.remark || "-",
      formatDate(log.time),
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 28,
      theme: "striped",
      headStyles: { fillColor: [109, 15, 22], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const fileDate = selectedDate || "All_Dates";
    doc.save(`Gate_Audit_Logs_${fileDate}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* NAVBAR */}
      <header className="bg-[#6d0f16] text-white px-8 py-4 shadow-md flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Gate Movement Audit Terminal
          </h1>
          <p className="text-xs text-white/70 mt-0.5">
            Historical audit logs of student exits and campus returns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadPDFReport}
            disabled={filteredLogs.length === 0}
            className="bg-white text-[#6d0f16] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            📥 Download PDF Log
          </button>

          <button
            onClick={handleClearLogs}
            className="bg-red-500/20 hover:bg-red-600 text-white border border-red-300/30 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            🗑️ Clear History Logs
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search log by student name, roll number, hostel or remark..."
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              {search && (
                <button
                  onClick={() => handleFilterChange(setSearch, "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider shrink-0">
                📅 Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleFilterChange(setSelectedDate, e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-2xl px-3 py-3 outline-none focus:border-[#6d0f16] transition"
              />
              {selectedDate && (
                <button
                  onClick={() => handleFilterChange(setSelectedDate, "")}
                  className="text-xs text-red-600 font-semibold hover:underline shrink-0 cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* DUAL BUTTON FILTERS */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">
                Action:
              </span>
              {["All", "EXIT", "RETURNED"].map((act) => (
                <button
                  key={act}
                  onClick={() => handleFilterChange(setActionFilter, act)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    actionFilter === act
                      ? "bg-[#6d0f16] text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {act === "EXIT" ? "🚪 Exit" : act === "RETURNED" ? "🏠 Returned" : "All Actions"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">
                Type:
              </span>
              {["All", "Local", "Outstation"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleFilterChange(setTypeFilter, t)}
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

        {/* AUDIT LOGS TABLE */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/80 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#6d0f16]">
              Gate Entry & Exit Log Records
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {filteredLogs.length} Records Found
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-medium">
              No gate movement logs recorded matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4 pl-6">Student</th>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Hostel / Room</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Pass Type</th>
                    <th className="p-4">Guard Remark</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedLogs.map((log) => {
                    const isExit = log.action?.toUpperCase() === "EXIT";
                    const isOutstation =
                      (log.outpassType || "").toLowerCase() === "outstation";

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 pl-6 font-bold text-gray-900">
                          {log.studentName}
                        </td>

                        <td className="p-4 text-xs font-medium text-gray-600">
                          {log.rollNo || "-"}
                        </td>

                        <td className="p-4 text-xs font-medium text-gray-600">
                          {log.hostel || "-"} {log.room ? `/ ${log.room}` : ""}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                              isExit
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {isExit ? "🚪 EXIT" : "🏠 RETURNED"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                              isOutstation
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-teal-50 text-teal-700 border border-teal-200"
                            }`}
                          >
                            {isOutstation ? "✈️ Outstation" : "📍 Local"}
                          </span>
                        </td>

                        <td className="p-4 text-xs text-gray-600 italic max-w-xs truncate">
                          "{log.remark || "No remark"}"
                        </td>

                        <td className="p-4 text-xs font-medium text-gray-500">
                          {formatDate(log.time)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalItems > 0 && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} total logs)
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
        )}
      </main>
    </div>
  );
}