import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import OutpassModal from "./OutpassModal";

import {
  apiFetch,
} from "../utils/api";

export default function ApprovedPage() {

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  /* ================= FETCH ================= */

  async function fetchApproved() {

    try {

      setLoading(true);
      setError("");

      const result = await apiFetch(
        "/api/students/status",
        {
          method: "POST",
          body: JSON.stringify({
            outp_status: "Approved",
          }),
        }
      );

      console.log(result);

      // Backend returns:
      // data: { outpasses: [...], pagination: {...} }

      setData(result?.data?.outpasses || []);

    } catch (err) {

      console.error(err);

      setError(
        err.message || "Failed to fetch approved outpasses"
      );

      setData([]);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApproved();
  }, []);

  /* ================= FILTER + SORT ================= */

  const processed = useMemo(() => {

    let arr = [...data];

    arr = arr.filter((o) => {

      const q = search.toLowerCase();

      return (
        o.name?.toLowerCase().includes(q) ||
        o.roll_no?.toLowerCase().includes(q) ||
        o.department?.toLowerCase().includes(q) ||
        o.room?.toLowerCase().includes(q) ||
        o.hostel?.toLowerCase().includes(q) ||
        o.place_of_visit?.toLowerCase().includes(q) ||
        o.purpose?.toLowerCase().includes(q)
      );

    });

    if (filter !== "All") {

      arr = arr.filter(
        (o) => o.outpass_type === filter
      );
    }

    if (sortBy === "latest") {

      arr.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }

    if (sortBy === "departure") {

      arr.sort(
        (a, b) =>
          new Date(a.departure_datetime) -
          new Date(b.departure_datetime)
      );
    }

    return arr;

  }, [
    data,
    search,
    filter,
    sortBy,
  ]);

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="p-10 text-center text-gray-500">
        Loading approved outpasses...
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error) {

    return (
      <div className="p-10 text-red-600">
        {error}
      </div>
    );
  }

  return (

    <div className="p-6 space-y-6">

      <div className="flex flex-wrap justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-green-700">
            Approved Outpasses
          </h1>

          <p className="text-gray-500 mt-1">
            Successfully approved requests
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <input
            placeholder="Search student, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-xl text-sm bg-white"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-4 py-2 rounded-xl text-sm bg-white"
          >
            <option>All</option>
            <option>Local</option>
            <option>Outstation</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-4 py-2 rounded-xl text-sm bg-white"
          >
            <option value="latest">Latest</option>
            <option value="departure">Departure Time</option>
          </select>

        </div>

      </div>

      {processed.length === 0 && (

        <div className="bg-white border rounded-3xl p-10 text-center text-gray-500 shadow-sm">
          No approved outpasses found
        </div>

      )}

      <div className="space-y-5">

        {processed.map((o) => (

          <div
            key={o.outpass_id}
            className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition"
          >

            <div className="flex justify-between items-start flex-wrap gap-4">

              <div>

                <div className="flex items-center gap-3 flex-wrap">

                  <h2 className="text-2xl font-bold text-gray-800">
                    {o.name}
                  </h2>

                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    Approved
                  </span>

                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {o.outpass_type}
                  </span>

                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {o.roll_no} • {o.department}
                </p>

              </div>

              <button
                onClick={() => setSelected(o)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
              >
                View
              </button>

            </div>

          </div>

        ))}

      </div>

      {selected && (
        <OutpassModal
          outpass={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  );
}

function Info({ label, value }) {

  return (
    <div className="bg-white border rounded-xl p-3">
      <p className="text-xs text-gray-500">
        {label}
      </p>
      <p className="font-semibold text-sm text-gray-800 mt-1 break-words">
        {value || "-"}
      </p>
    </div>
  );
}