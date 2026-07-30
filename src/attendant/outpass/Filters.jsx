import React from "react";

export default function Filters({
  search,
  setSearch,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  showing,
  total,
}) {
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm">
      <div className="grid lg:grid-cols-4 gap-3">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll number..."
          className="border rounded-lg px-4 py-2 text-sm outline-none focus:border-[#6d0f16]"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="All">All</option>
          <option value="Home">Home</option>
          <option value="Local">Local</option>
          <option value="Outstation">Outstation</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="latest">Latest</option>
          <option value="departure">Departure</option>
        </select>

        <div className="flex items-center justify-end text-sm text-gray-500">
          Showing
          <span className="font-semibold text-black mx-1">
            {showing}
          </span>
          of
          <span className="font-semibold text-black mx-1">
            {total}
          </span>
        </div>

      </div>
    </div>
  );
}