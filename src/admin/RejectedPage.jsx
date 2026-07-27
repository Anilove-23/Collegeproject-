import React, { useMemo, useState } from "react";
import InstructionBox from "./InstructionBox";
import OutpassModal from "./OutpassModal";

export default function RejectedPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [data] = useState([
    {
      id: 1,
      student_name: "Amit",
      room: "C-5",
      type: "Home",
      place: "UP",
      purpose: "Emergency",
      departure: "2026-05-21T09:00",
      arrival: "2026-05-21T18:00",
      status: "Rejected",
      note: "Not enough valid reason provided",
    },
    {
      id: 2,
      student_name: "Rohit",
      room: "A-10",
      type: "Market",
      place: "-",
      purpose: "-",
      departure: "2026-05-22T17:00",
      arrival: "2026-05-22T19:00",
      status: "Rejected",
      note: "Late request submitted",
    },
  ]);

  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.departure) - new Date(a.departure)
    );
  }, [data]);

  const filtered = sorted.filter(o => {
    const matchType = filter === "All" || o.type === filter;

    const matchSearch =
      o.student_name.toLowerCase().includes(search.toLowerCase()) ||
      o.room.toLowerCase().includes(search.toLowerCase()) ||
      o.place.toLowerCase().includes(search.toLowerCase()) ||
      (o.note || "").toLowerCase().includes(search.toLowerCase());

    const matchDate =
      !dateFilter || o.departure.split("T")[0] === dateFilter;

    return matchType && matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">

      <InstructionBox />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        <h1 className="text-2xl font-bold text-red-700">
          Rejected Outpasses
        </h1>

        <div className="flex flex-wrap gap-2">

          <input
            placeholder="Search name, room, place, remark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="All">All</option>
            <option value="Home">Home</option>
            <option value="Market">Market</option>
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

              <div className="space-y-1">

                <div className="flex items-center gap-2 flex-wrap">

                  <p className="font-semibold text-lg">
                    {o.student_name}
                  </p>

                  <span className="text-xs px-2 py-1 bg-red-50 text-red-700 border rounded-full">
                    Rejected
                  </span>

                  <span className="text-xs px-2 py-1 bg-gray-100 border rounded-full">
                    {o.type}
                  </span>

                </div>

                <p className="text-sm text-gray-600">
                  Room: <b>{o.room}</b>
                </p>

                <p className="text-xs text-gray-500">
                  {o.departure} → {o.arrival}
                </p>

                {/* 🔥 REMARK SHOW */}
                {o.note && (
                  <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded-md inline-block">
                    📝 Remark: {o.note}
                  </p>
                )}

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
                    Market outpass → no extra details
                  </p>
                )}

                {/* ALSO SHOW REMARK HERE */}
                {o.note && (
                  <p className="mt-2 text-red-600">
                    <b>Remark:</b> {o.note}
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