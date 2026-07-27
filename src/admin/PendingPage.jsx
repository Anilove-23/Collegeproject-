import React, { useMemo, useState } from "react";
import InstructionBox from "./InstructionBox";
import OutpassModal from "./OutpassModal";

export default function PendingPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [noteBox, setNoteBox] = useState({ id: null, text: "", action: "" });

  const [data, setData] = useState([
    {
      id: 1,
      student_name: "Rahul Sharma",
      room: "A-12",
      type: "Home",
      place: "Delhi",
      purpose: "Family Visit",
      departure: "2026-05-21T10:00",
      arrival: "2026-05-21T20:00",
      status: "Pending",
      note: "",
    },
    {
      id: 2,
      student_name: "Aman Verma",
      room: "B-21",
      type: "Market",
      place: "-",
      purpose: "-",
      departure: "2026-05-22T17:00",
      arrival: "2026-05-22T19:00",
      status: "Pending",
      note: "",
    },
  ]);

  // ✅ STATUS UPDATE (FIX: properly remove from pending view)
  function updateStatus(id, status, note) {
    setData(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status, note } : o
      )
    );
    setNoteBox({ id: null, text: "", action: "" });
  }

  // 🔥 SORT: latest departure first
  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.departure) - new Date(a.departure)
    );
  }, [data]);

  // 🔍 FILTER (ONLY PENDING SHOWN HERE FIXED)
  const filtered = sorted.filter(o => {
    const isPending = o.status === "Pending";

    const matchesType = filter === "All" || o.type === filter;

    const matchesSearch =
      o.student_name.toLowerCase().includes(search.toLowerCase()) ||
      o.room.toLowerCase().includes(search.toLowerCase()) ||
      (o.place || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.purpose || "").toLowerCase().includes(search.toLowerCase());

    const matchesDate =
      !dateFilter || o.departure.split("T")[0] === dateFilter;

    return isPending && matchesType && matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">

      <InstructionBox />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <h1 className="text-2xl font-bold text-[#6d0f16]">
          Pending Outpasses
        </h1>

        <div className="flex flex-wrap gap-2">

          <input
            placeholder="Search student / room / place"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="All">All</option>
            <option value="Home">Home</option>
            <option value="Market">Market</option>
          </select>

        </div>
      </div>

      {/* CARDS */}
      <div className="space-y-4">

        {filtered.map(o => (
          <div
            key={o.id}
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >

            {/* TOP */}
            <div className="flex flex-col md:flex-row md:justify-between gap-4">

              {/* LEFT */}
              <div className="space-y-1">

                <div className="flex items-center gap-2 flex-wrap">

                  <p className="font-semibold text-lg">
                    {o.student_name}
                  </p>

                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border">
                    {o.status}
                  </span>

                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">
                    {o.type}
                  </span>

                </div>

                <p className="text-sm text-gray-600">
                  Room: <b>{o.room}</b>
                </p>

                {/* ✅ FIXED HOME / MARKET DISPLAY */}
                {o.type === "Home" ? (
                  <div className="text-xs text-gray-600 space-y-1 mt-1">
                    <p>📍 Place: <b>{o.place}</b></p>
                    <p>🎯 Purpose: <b>{o.purpose}</b></p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    🛒 Market visit (no extra details)
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  🕒 {o.departure.replace("T", " ")} → {o.arrival.replace("T", " ")}
                </p>

                {o.note && (
                  <p className="text-xs text-blue-600 mt-1">
                    📝 Note: {o.note}
                  </p>
                )}

              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex flex-wrap gap-2 md:items-center">

                <button
                  onClick={() => setSelected(o)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  View
                </button>

                <button
                  onClick={() =>
                    setNoteBox({ id: o.id, action: "approve", text: "" })
                  }
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    setNoteBox({ id: o.id, action: "reject", text: "" })
                  }
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg"
                >
                  Reject
                </button>

              </div>
            </div>

            {/* NOTE BOX */}
            {noteBox.id === o.id && (
              <div className="mt-4 border-t pt-3 space-y-2">

                <textarea
                  placeholder="Add remark (optional)"
                  value={noteBox.text}
                  onChange={e =>
                    setNoteBox({ ...noteBox, text: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 text-sm"
                />

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      updateStatus(
                        o.id,
                        noteBox.action === "approve" ? "Approved" : "Rejected",
                        noteBox.text
                      )
                    }
                    className="px-3 py-1 text-xs bg-black text-white rounded-lg"
                  >
                    Submit
                  </button>

                  <button
                    onClick={() =>
                      setNoteBox({ id: null, text: "", action: "" })
                    }
                    className="px-3 py-1 text-xs border rounded-lg"
                  >
                    Cancel
                  </button>

                </div>
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