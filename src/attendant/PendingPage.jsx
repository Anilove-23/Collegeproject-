import React, { useEffect, useMemo, useRef, useState } from "react";
import OutpassModal from "./OutpassModal";
import { apiFetch } from "../utils/api";

export default function PendingPage() {
  // ---------- state ----------
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null); // "approve" | "reject" | null
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const selectAllRef = useRef(null);

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

  // ---------- fetch ----------
  async function fetchPending(currentPage = page) {
    try {
      setLoading(true);
      setError("");
      const result = await apiFetch(`/api/outpasses/pending?page=${currentPage}&limit=${limit}`);
      setData(result?.data?.outpasses || []);
      setPagination(result?.data?.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending(page);
    setSelectedIds([]); // reset selection on page change
  }, [page]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------- search + filter + sort ----------
  const processed = useMemo(() => {
    let arr = [...data];
    const q = search.toLowerCase();

    arr = arr.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.roll_no?.toLowerCase().includes(q) ||
        o.department?.toLowerCase().includes(q) ||
        o.hostel?.toLowerCase().includes(q) ||
        o.room?.toLowerCase().includes(q) ||
        o.place_of_visit?.toLowerCase().includes(q) ||
        o.purpose?.toLowerCase().includes(q)
    );

    if (filter !== "All") arr = arr.filter((o) => o.outpass_type === filter);

    arr.sort((a, b) =>
      sortBy === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.departure_datetime) - new Date(b.departure_datetime)
    );

    return arr;
  }, [data, search, filter, sortBy]);

  // ---------- select all (indeterminate) ----------
  useEffect(() => {
    if (!selectAllRef.current) return;
    const allSelected = processed.length > 0 && selectedIds.length === processed.length;
    selectAllRef.current.indeterminate = selectedIds.length > 0 && !allSelected;
  }, [selectedIds, processed]);

  const toggleSelectAll = (checked) =>
    setSelectedIds(checked ? processed.map((o) => o.id) : []);

  const toggleRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // ---------- single approve/reject ----------
  async function approve(id) {
    try {
      await apiFetch(`/api/outpasses/approve/${id}`, { method: "PATCH" });
      fetchPending(page);
    } catch (err) {
      alert(err.message);
    }
  }

  async function reject(id) {
    try {
      await apiFetch(`/api/outpasses/reject/${id}`, { method: "PATCH" });
      fetchPending(page);
    } catch (err) {
      alert(err.message);
    }
  }

  // ---------- bulk action ----------
  async function runBulkAction(action) {
    if (selectedIds.length === 0) return;
    try {
      setBulkLoading(true);
      await apiFetch("/api/outpasses/bulk-action", {
        method: "PATCH",
        body: JSON.stringify({ outpass_ids: selectedIds, action }),
      });
      setToast({
        type: "success",
        message: `${selectedIds.length} outpass${selectedIds.length > 1 ? "es" : ""} ${
          action === "approve" ? "approved" : "rejected"
        }`,
      });
      setSelectedIds([]);
      fetchPending(page);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Bulk action failed" });
    } finally {
      setBulkLoading(false);
      setConfirmAction(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-gray-500 text-lg">Loading Pending Outpasses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">{error}</div>
      </div>
    );
  }

  const allSelected = processed.length > 0 && selectedIds.length === processed.length;

  return (
    <div className="p-6 space-y-5 relative">
      {/* header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold text-[#6d0f16]">Pending Outpasses</h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve or reject hostel outpass requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchPending(page)} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm">
            Refresh
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#6d0f16] text-white text-sm">
            Pending : {pagination.total}
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending" value={pagination.total} />
        <StatCard title="Page" value={pagination.page} />
        <StatCard title="Total Pages" value={pagination.totalPages} />
        <StatCard title="Showing" value={processed.length} />
      </div>

      {/* filter bar */}
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="grid lg:grid-cols-4 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number..."
            className="border rounded-lg px-4 py-2 text-sm outline-none focus:border-[#6d0f16]"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg px-4 py-2 text-sm">
            <option>All</option>
            <option>Local</option>
            <option>Outstation</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-lg px-4 py-2 text-sm">
            <option value="latest">Latest</option>
            <option value="departure">Departure</option>
          </select>
          <div className="flex items-center justify-end text-sm text-gray-500">
            Showing <span className="font-semibold text-black mx-1">{processed.length}</span> of{" "}
            <span className="font-semibold text-black mx-1">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#6d0f16] text-white rounded-2xl px-5 py-3 shadow-md">
          <div className="text-sm">
            <span className="font-semibold">{selectedIds.length}</span> selected
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmAction("approve")} disabled={bulkLoading} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm disabled:opacity-50">
              Approve Selected
            </button>
            <button onClick={() => setConfirmAction("reject")} disabled={bulkLoading} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50">
              Reject Selected
            </button>
            <button onClick={() => setSelectedIds([])} disabled={bulkLoading} className="px-4 py-2 rounded-lg border border-white/40 hover:bg-white/10 text-sm disabled:opacity-50">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-4 w-10">
                <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} />
              </th>
              <th className="px-5 py-4">Student</th>
              <th className="px-5 py-4">Hostel</th>
              <th className="px-5 py-4">Room</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Departure</th>
              <th className="px-5 py-4">Updated</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No pending outpasses found.
                </td>
              </tr>
            )}

            {processed.map((o) => (
              <tr key={o.id} className={`border-b last:border-none hover:bg-gray-50 transition ${selectedIds.includes(o.id) ? "bg-red-50/40" : ""}`}>
                <td className="px-4 py-4">
                  <input type="checkbox" checked={selectedIds.includes(o.id)} onChange={() => toggleRow(o.id)} />
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold">{o.name}</p>
                  <p className="text-xs text-gray-500">{o.roll_no}</p>
                  <p className="text-xs text-gray-400">{o.department}</p>
                </td>
                <td className="px-5 py-4">{o.hostel}</td>
                <td className="px-5 py-4">{o.room || "-"}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs">{o.outpass_type}</span>
                </td>
                <td className="px-5 py-4 text-sm">{new Date(o.departure_datetime).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{new Date(o.updated_at).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => setSelected(o)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100">
                      View
                    </button>
                    <button onClick={() => approve(o.id)} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => reject(o.id)} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* footer / pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-black mx-1">{pagination.total === 0 ? 0 : (page - 1) * limit + 1}</span>-
          <span className="font-semibold text-black mx-1">{Math.min(page * limit, pagination.total)}</span> of{" "}
          <span className="font-semibold text-black mx-1">{pagination.total}</span> requests
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .slice(Math.max(page - 3, 0), Math.min(page + 2, pagination.totalPages))
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm transition ${page === p ? "bg-[#6d0f16] text-white" : "border hover:bg-gray-100"}`}
              >
                {p}
              </button>
            ))}

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {selected && <OutpassModal outpass={selected} onClose={() => setSelected(null)} />}

      {/* confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {confirmAction === "approve" ? "Approve selected outpasses?" : "Reject selected outpasses?"}
            </h3>
            <p className="text-sm text-gray-500">
              This will {confirmAction} {selectedIds.length} outpass{selectedIds.length > 1 ? "es" : ""}. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmAction(null)} disabled={bulkLoading} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={() => runBulkAction(confirmAction)}
                disabled={bulkLoading}
                className={`px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 ${confirmAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {bulkLoading ? "Processing..." : `Yes, ${confirmAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2 text-[#6d0f16]">{value}</h2>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}