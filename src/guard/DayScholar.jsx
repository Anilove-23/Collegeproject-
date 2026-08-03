import React, { useState, useEffect, useMemo } from "react";

export default function DayScholar() {
  const [scholars, setScholars] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("scholars"); // 'scholars' | 'logs'
  const [actionLoading, setActionLoading] = useState(null); // id of scholar being actioned

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [scholarsRes, logsRes] = await Promise.all([
        fetch("http://localhost:5000/api/v1/dayscholar"),
        fetch("http://localhost:5000/api/v1/dayscholar/logs")
      ]);

      if (!scholarsRes.ok || !logsRes.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const scholarsData = await scholarsRes.json();
      const logsData = await logsRes.json();

      setScholars(scholarsData);
      setLogs(logsData);
    } catch (err) {
      console.error(err);
      setError("Unable to load day scholar data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMark(scholarId, direction) {
    setActionLoading(scholarId);
    try {
      const res = await fetch("http://localhost:5000/api/v1/dayscholar/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholar_id: scholarId,
          direction: direction,
          guard_id: null // Ideally fetch from auth context, but null is accepted
        })
      });

      if (!res.ok) throw new Error("Failed to mark " + direction);
      
      // Refresh logs
      const logsRes = await fetch("http://localhost:5000/api/v1/dayscholar/logs");
      const logsData = await logsRes.json();
      setLogs(logsData);

    } catch (err) {
      console.error(err);
      alert("Error marking " + direction + ": " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredScholars = useMemo(() => {
    return scholars.filter((s) => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.roll_no.toLowerCase().includes(search.toLowerCase())
    );
  }, [scholars, search]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => 
      l.scholar_name?.toLowerCase().includes(search.toLowerCase()) || 
      l.scholar_roll_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#6d0f16]">☀️ Day Scholar Terminal</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage entries and exits for non-residential students</p>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16]/20 transition-all w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-xs text-sm font-medium mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("scholars")}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
            activeTab === "scholars"
              ? "bg-[#6d0f16] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Scholars Directory ({scholars.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
            activeTab === "logs"
              ? "bg-[#6d0f16] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Recent Activity Logs ({logs.length})
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-white border border-gray-200/80 rounded-3xl shadow-sm">
        
        {loading ? (
          <div className="flex items-center justify-center h-full p-16 flex-col gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#6d0f16] rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading Data...</p>
          </div>
        ) : activeTab === "scholars" ? (
          /* SCHOLARS TABLE */
          filteredScholars.length === 0 ? (
             <div className="p-16 text-center text-gray-400 font-medium">No scholars found matching criteria.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Degree & Phone</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredScholars.map(scholar => {
                  // Determine status by finding their most recent log
                  const lastLog = logs.find(l => l.day_scholar_id === scholar.id);
                  const isInside = lastLog ? lastLog.direction === 'ENTRY' : false;

                  return (
                    <tr key={scholar.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{scholar.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{scholar.roll_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{scholar.degree_type || '-'}</div>
                        <div className="text-xs text-gray-400">{scholar.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide border ${
                            isInside ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                         }`}>
                           {isInside ? 'In Campus' : 'Outside'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleMark(scholar.id, 'ENTRY')}
                            disabled={actionLoading === scholar.id || isInside}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Mark Entry
                          </button>
                          <button
                            onClick={() => handleMark(scholar.id, 'EXIT')}
                            disabled={actionLoading === scholar.id || !isInside}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Mark Exit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        ) : (
          /* LOGS TABLE */
          filteredLogs.length === 0 ? (
             <div className="p-16 text-center text-gray-400 font-medium">No activity logs found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Direction</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Gate</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide border flex w-min items-center gap-1 ${
                        log.direction === 'ENTRY' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {log.direction === 'ENTRY' ? '➡️ Entry' : '⬅️ Exit'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{log.scholar_name}</div>
                      <div className="text-xs text-gray-500 font-medium">{log.scholar_roll_no}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{log.gate || '-'}</td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">
                       {new Date(log.timestamp).toLocaleString('en-IN', {
                         dateStyle: 'short',
                         timeStyle: 'medium'
                       })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
