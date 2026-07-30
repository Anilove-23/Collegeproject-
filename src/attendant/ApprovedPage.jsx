import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import OutpassModal from "./OutpassModal";
import { apiFetch } from "../utils/api";

import {
  Header,
  Stats,
  Filters,
  HistoryTable,
  Pagination,
  Toast,
} from "./outpass";

export default function ApprovedPage() {
  // ===========================
  // State
  // ===========================

  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  const [data, setData] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ===========================
  // Fetch
  // ===========================

  async function fetchApproved(currentPage = page) {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch(
        `/api/students/status?page=${currentPage}&limit=${limit}`,
        {
          method: "POST",
          body: JSON.stringify({
            outp_status: "Approved",
          }),
        }
      );

      setData(result?.data?.outpasses || []);

      setPagination(
        result?.data?.pagination || {
          page: 1,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to fetch approved outpasses"
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }

  // ===========================
  // Effects
  // ===========================

  useEffect(() => {
    fetchApproved(page);
  }, [page]);

  // ===========================
  // Search + Filter + Sort
  // ===========================

  const processed = useMemo(() => {
    let arr = [...data];

    const q = search.toLowerCase();

    arr = arr.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.roll_no?.toLowerCase().includes(q) ||
        o.department?.toLowerCase().includes(q) ||
        o.room?.toLowerCase().includes(q) ||
        o.hostel?.toLowerCase().includes(q) ||
        o.place_of_visit?.toLowerCase().includes(q) ||
        o.purpose?.toLowerCase().includes(q)
    );

    if (filter !== "All") {
      arr = arr.filter(
        (o) => o.outpass_type === filter
      );
    }

    arr.sort((a, b) =>
      sortBy === "latest"
        ? new Date(b.created_at) -
          new Date(a.created_at)
        : new Date(a.departure_datetime) -
          new Date(b.departure_datetime)
    );

    return arr;
  }, [
    data,
    search,
    filter,
    sortBy,
  ]);

  // ===========================
  // Loading
  // ===========================

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading approved outpasses...
      </div>
    );
  }

  // ===========================
  // Error
  // ===========================

  if (error) {
    return (
      <div className="p-10 text-red-600">
        {error}
      </div>
    );
  }
  return (
  <div className="p-6 space-y-6">

    <Header
      title="Approved Outpasses"
      subtitle="Successfully approved requests"
      total={pagination.total}
      buttonLabel="Approved"
      buttonColor="bg-green-600"
      onRefresh={() => fetchApproved(page)}
    />

    <Stats
      total={pagination.total}
      page={pagination.page}
      totalPages={pagination.totalPages}
      showing={processed.length}
      color="text-green-700"
    />

    <Filters
      search={search}
      setSearch={setSearch}
      filter={filter}
      setFilter={setFilter}
      sortBy={sortBy}
      setSortBy={setSortBy}
      showing={processed.length}
      total={pagination.total}
    />

    <HistoryTable
      data={processed}
      onView={setSelected}
      statusColor="bg-green-100 text-green-700"
      emptyMessage="No approved outpasses found"
    />

    <Pagination
      page={page}
      setPage={setPage}
      pagination={pagination}
      limit={limit}
      label="approved requests"
      color="bg-green-600"
    />

    {selected && (
      <OutpassModal
        outpass={selected}
        onClose={() => setSelected(null)}
      />
    )}

    <Toast
      toast={toast}
      onClose={() => setToast(null)}
    />

  </div>
);
}