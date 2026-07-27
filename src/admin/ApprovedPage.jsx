import React, { useMemo, useState } from "react";
import InstructionBox from "./InstructionBox";
import OutpassModal from "./OutpassModal";

export default function ApprovedPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [data] = useState([
    {
      id: 1,
      student_name: "Aman Verma",
      room: "B-10",
      type: "Local",
      place: "Market",
      purpose: "Shopping",
      departure: "2026-05-21T10:00",
      arrival: "2026-05-21T18:00",
      status: "Approved",
    },
    {
      id: 2,
      student_name: "Rahul Sharma",
      room: "A-12",
      type: "Home",
      place: "Delhi",
      purpose: "Family Visit",
      departure: "2026-05-22T09:00",
      arrival: "2026-05-22T20:00",
      status: "Approved",
    },
  ]);

  // 🔥 latest first
  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.departure) - new Date(a.departure)
    );
  }, [data]);

  // 🔍 FILTER + SEARCH + DATE
  const filtered = sorted.filter(o => {
    const matchType = filter === "All" || o.type === filter;

    const matchSearch =
      o.student_name.toLowerCase().includes(search.toLowerCase()) ||
      o.room.toLowerCase().includes(search.toLowerCase()) ||
      o.place.toLowerCase().includes(search.toLowerCase()) ||
      o.purpose.toLowerCase().includes(search.toLowerCase());

    const matchDate =
      !dateFilter || o.departure.split("T")[0] === dateFilter;

    return matchType && matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">

      {/* INSTRUCTION */}
      <InstructionBox />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        <h1 className="text-2xl font-bold text-green-700">
          Approved Outpasses
        </h1>

        <div className="flex flex-wrap gap-2">

          {/* SEARCH */}
          <input
            placeholder="Search name, room, place..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          {/* DATE */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          {/* FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="All">All</option>
            <option value="Home">Home</option>
            <option value="Local">Market</option>
          </select>

        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {filtered.map(o => (
          <div
            key={o.id}
            className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >

            {/* TOP */}
            <div className="flex justify-between items-start">

              <div>

                <div className="flex gap-2 items-center flex-wrap">

                  <p className="font-semibold text-lg">
                    {o.student_name}
                  </p>

                  <span className="text-xs px-2 py-1 bg-green-50 text-green-700 border rounded-full">
                    Approved
                  </span>

                  <span className="text-xs px-2 py-1 bg-gray-100 border rounded-full">
                    {o.type}
                  </span>

                </div>

                <p className="text-sm text-gray-600">
                  Room: {o.room}
                </p>

                <p className="text-xs text-gray-500">
                  Departure: {o.departure} | Arrival: {o.arrival}
                </p>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <button
                  onClick={() => setSelected(o)}
                  className="px-3 py-1 text-xs bg-gray-100 rounded-lg"
                >
                  View
                </button>

                <button
                  onClick={() =>
                    setExpandedId(expandedId === o.id ? null : o.id)
                  }
                  className="px-3 py-1 text-xs bg-blue-100 rounded-lg"
                >
                  {expandedId === o.id ? "Less" : "More"}
                </button>

              </div>
            </div>

            {/* EXPAND */}
            {expandedId === o.id && (
              <div className="mt-3 border-t pt-3 text-sm text-gray-700">

                {o.type === "Home" ? (
                  <>
                    <p><b>Place:</b> {o.place}</p>
                    <p><b>Purpose:</b> {o.purpose}</p>
                  </>
                ) : (
                  <p className="text-gray-500">
                    Market outpass → only timing required
                  </p>
                )}

              </div>
            )}

          </div>
        ))}

      </div>

      {/* MODAL */}
      {selected && (
        <OutpassModal
          outpass={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  );
}