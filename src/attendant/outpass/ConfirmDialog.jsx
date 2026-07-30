import React from "react";

export default function ConfirmDialog({
  open,
  action,
  count,
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

        <h3 className="text-lg font-semibold mb-3">
          {isApprove
            ? "Approve selected outpasses?"
            : "Reject selected outpasses?"}
        </h3>

        <p className="text-sm text-gray-500">
          This will{" "}
          <span className="font-semibold">
            {isApprove ? "approve" : "reject"}
          </span>{" "}
          {count} outpass{count !== 1 ? "es" : ""}.
        </p>

        <p className="text-sm text-red-500 mt-2">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } disabled:opacity-50`}
          >
            {loading
              ? "Processing..."
              : isApprove
              ? "Approve"
              : "Reject"}
          </button>

        </div>
      </div>
    </div>
  );
}