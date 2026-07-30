import React from "react";

export default function RowActions({
  status,
  outpass,
  onView,
  onApprove,
  onReject,
}) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <button
        onClick={() => onView(outpass)}
        className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-100 transition"
      >
        View
      </button>

      {status === "Pending" && (
        <>
          <button
            onClick={() => onApprove(outpass)}
            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition"
          >
            Approve
          </button>

          <button
            onClick={() => onReject(outpass)}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
          >
            Reject
          </button>
        </>
      )}
    </div>
  );
}