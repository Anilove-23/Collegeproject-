import React, { useEffect, useState } from "react";

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

export default function GateLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

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
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.studentName?.toLowerCase().includes(q) ||
      log.rollNo?.toLowerCase().includes(q) ||
      log.hostel?.toLowerCase().includes(q) ||
      log.remark?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6d0f16] tracking-tight">
            Gate Movement Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Historical trail of student exits and returns recorded at main gate
          </p>
        </div>

        <button
          onClick={handleClearLogs}
          className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          Clear History Logs
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search log by student name, roll number, hostel or remark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-xs outline-none focus:bg-white focus:border-[#6d0f16] transition"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
          Total Logs: {filteredLogs.length}
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">
            No gate movement logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Hostel / Room</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Guard Remark</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {log.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{log.rollNo || "-"}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {log.hostel || "-"} {log.room ? `/ ${log.room}` : ""}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.action === "EXIT"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 italic max-w-xs truncate">
                      "{log.remark}"
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs">
                      {formatDate(log.time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}