import React from "react";

export default function BulkToolbar({
  selectedCount,
  onApprove,
  onReject,
  onClear,
  loading = false,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-2 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#6d0f16] text-white rounded-2xl px-5 py-3 shadow-md">
      <div className="text-sm">
        <span className="font-semibold">{selectedCount}</span>{" "}
        {selectedCount === 1 ? "request" : "requests"} selected
      </div>

      <div className="flex flex-wrap items-center gap-2">

        <button
          onClick={onApprove}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm disabled:opacity-50"
        >
          Approve Selected
        </button>

        <button
          onClick={onReject}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
        >
          Reject Selected
        </button>

        <button
          onClick={onClear}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-white/40 hover:bg-white/10 text-sm disabled:opacity-50"
        >
          Clear Selection
        </button>

      </div>
    </div>
  );
}