import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import OutpassModal from "./OutpassModal";
import { apiFetch } from "../utils/api";

import {
  Header,
  Stats,
  Filters,
  PendingTable,
  Pagination,
  BulkToolbar,
  RemarkDialog,
  Toast,
} from "./outpass";

export default function PendingPage() {
  // ===========================
  // State
  // ===========================

  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [data, setData] = useState([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Remark dialog (drives both single and bulk approve/reject)
  const [remarkDialog, setRemarkDialog] = useState({
    open: false,
    action: "",
    ids: [],
  });
  const [remarkLoading, setRemarkLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Select all checkbox
  const selectAllRef = useRef(null);

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
  // Fetch Pending Requests
  // ===========================

  async function fetchPending(currentPage = page) {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch(
        `/api/outpasses/pending?page=${currentPage}&limit=${limit}`
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
        err.message || "Unable to load pending outpasses."
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  }

  // ===========================
  // View (fetch full outpass details)
  // ===========================

  async function handleView(outpass) {
    try {
      const result = await apiFetch(
        `/api/students/outpass/${outpass.id}`
      );

      setSelected(result.data);
    } catch (err) {
      console.error(err);

      setToast({
        type: "error",
        message:
          err.message ||
          "Failed to fetch outpass details",
      });
    }
  }

  // ===========================
  // Effects
  // ===========================

  useEffect(() => {
    fetchPending(page);

    // Clear selected rows when page changes
    setSelectedIds([]);
  }, [page]);

  // ===========================
  // Search + Filter + Sort
  // (Hoisted above early returns — must run on every render)
  // ===========================

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
  }, [data, search, filter, sortBy]);

  // ===========================
  // Select All Checkbox
  // (Hoisted above early returns — must run on every render)
  // ===========================

  useEffect(() => {
    if (!selectAllRef.current) return;

    const all =
      processed.length > 0 &&
      selectedIds.length === processed.length;

    selectAllRef.current.indeterminate =
      selectedIds.length > 0 && !all;
  }, [processed, selectedIds]);

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(processed.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ===========================
  // Single Approve (opens remark dialog)
  // ===========================

  function approve(id) {
    setRemarkDialog({
      open: true,
      action: "approve",
      ids: [id],
    });
  }

  // ===========================
  // Single Reject (opens remark dialog)
  // ===========================

  function reject(id) {
    setRemarkDialog({
      open: true,
      action: "reject",
      ids: [id],
    });
  }

  // ===========================
  // Bulk Approve / Reject (open remark dialog)
  // ===========================

  function bulkApprove() {
    if (selectedIds.length === 0) return;

    setRemarkDialog({
      open: true,
      action: "approve",
      ids: selectedIds,
    });
  }

  function bulkReject() {
    if (selectedIds.length === 0) return;

    setRemarkDialog({
      open: true,
      action: "reject",
      ids: selectedIds,
    });
  }

  // ===========================
  // Remark Dialog Submit
  // Handles both single (ids.length === 1) and bulk (ids.length > 1)
  // ===========================

  async function submitRemark(remark) {
    const { action, ids } = remarkDialog;

    if (ids.length === 0) return;

    if (action === "reject" && !remark?.trim()) {
      setToast({
        type: "error",
        message: "A remark is required to reject an outpass.",
      });
      return;
    }

    try {
      setRemarkLoading(true);

      if (ids.length === 1) {
        await apiFetch(
          `/api/outpasses/${action}/${ids[0]}`,
          {
            method: "PATCH",
            body: JSON.stringify({ remark }),
          }
        );
      } else {
        await apiFetch(
          "/api/outpasses/bulk-action",
          {
            method: "PATCH",
            body: JSON.stringify({
              outpass_ids: ids,
              action,
              remark,
            }),
          }
        );
      }

      setToast({
        type: "success",
        message: `${ids.length} outpass${
          ids.length > 1 ? "es" : ""
        } ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`,
      });

      setRemarkDialog({ open: false, action: "", ids: [] });
      setSelectedIds([]);

      fetchPending(page);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Action failed.",
      });
    } finally {
      setRemarkLoading(false);
    }
  }

  const allSelected =
    processed.length > 0 &&
    processed.length === selectedIds.length;

  // ===========================
  // Loading
  // (Early returns now come AFTER every hook call)
  // ===========================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-lg text-gray-500">
          Loading Pending Outpasses...
        </div>
      </div>
    );
  }

  // ===========================
  // Error
  // ===========================

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // ===========================
  // Render
  // ===========================

  return (
    <div className="p-4 sm:p-6 space-y-5 relative">
      <Header
        title="Pending Outpasses"
        subtitle="Review, approve or reject hostel outpass requests"
        total={pagination.total}
        buttonLabel="Pending"
        onRefresh={() => fetchPending(page)}
      />

      <Stats
        total={pagination.total}
        page={pagination.page}
        totalPages={pagination.totalPages}
        showing={processed.length}
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

      <BulkToolbar
        selectedCount={selectedIds.length}
        loading={remarkLoading}
        onApprove={bulkApprove}
        onReject={bulkReject}
        onClear={() => setSelectedIds([])}
      />

      <PendingTable
        data={processed}
        selectedIds={selectedIds}
        selectAllRef={selectAllRef}
        allSelected={allSelected}
        toggleSelectAll={toggleSelectAll}
        toggleRow={toggleRow}
        onView={handleView}
        onApprove={approve}
        onReject={reject}
      />

      <Pagination
        page={page}
        setPage={setPage}
        pagination={pagination}
        limit={limit}
        label="pending requests"
      />

      {selected && (
        <OutpassModal
          outpass={selected?.outpass}
          remarks={selected?.remarks}
          onClose={() => setSelected(null)}
        />
      )}

      <RemarkDialog
        open={remarkDialog.open}
        action={remarkDialog.action}
        count={remarkDialog.ids.length}
        loading={remarkLoading}
        requireRemark={remarkDialog.action === "reject"}
        onCancel={() =>
          setRemarkDialog({ open: false, action: "", ids: [] })
        }
        onSubmit={submitRemark}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}