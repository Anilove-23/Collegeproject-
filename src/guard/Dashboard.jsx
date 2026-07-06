import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

  const [status, setStatus] = useState("All");       // In / Out
  const [approval, setApproval] = useState("All");   // ✅ NEW
  const [sort, setSort] = useState("LATEST");

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const result = await apiFetch("/api/outpasses/monitor");
      setData(result?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    let list = [...data];

    // In / Out
    if (status !== "All") {
      list = list.filter(
        (o) => o.std_status === status
      );
    }

    // ✅ Approved / Pending / Rejected
    if (approval !== "All") {
      list = list.filter(
        (o) => o.outp_status === approval
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.roll_no?.toLowerCase().includes(q) ||
          o.room?.toLowerCase().includes(q) ||
          o.hostel?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sort === "LATEST"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

    return list;
  }, [data, search, status, approval, sort]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-[#6d0f16]">
        Guard Dashboard
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* ================= FILTERS ================= */}

      <div className="bg-white border rounded-3xl p-5 space-y-4">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search student / room / roll..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-2xl px-4 py-3"
        />

        {/* In / Out */}
        <div className="flex gap-3">
          {["All", "In", "Out"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-5 py-2 rounded-full text-sm font-semibold
                ${status === s
                  ? "bg-[#6d0f16] text-white"
                  : "bg-gray-100"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ✅ Approved / Pending / Rejected */}
        <div className="flex gap-3">
          {["All", "Approved", "Pending", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setApproval(s)}
              className={`px-5 py-2 rounded-full text-sm font-semibold
                ${approval === s
                  ? "bg-green-700 text-white"
                  : "bg-gray-100"}`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* ================= LIST ================= */}

      <div className="space-y-5">

        {filtered.map((o) => (
          <div
            key={o.id}
            className="bg-white border rounded-3xl p-6"
          >
            <h2 className="text-2xl font-bold">
              {o.name}
            </h2>

            <p className="text-gray-600">
              {o.roll_no} • {o.department}
            </p>

            <div className="flex gap-3 mt-2">
              <span className="px-3 py-1 bg-blue-100 rounded-full">
                {o.std_status}
              </span>
              <span className="px-3 py-1 bg-yellow-100 rounded-full">
                {o.outp_status}
              </span>
            </div>

            <div className="mt-4">
              Departure: {formatDate(o.departure_datetime)} <br />
              Arrival: {formatDate(o.arrival_datetime)}
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="text-center text-gray-500">
            No records found
          </div>
        )}
      </div>
    </div>
  );
}