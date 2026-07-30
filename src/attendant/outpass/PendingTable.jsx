import React from "react";

export default function PendingTable({
  data,
  selectedIds,
  selectAllRef,
  allSelected,
  toggleSelectAll,
  toggleRow,
  onView,
  onApprove,
  onReject,
}) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-4 py-4 w-10">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
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
          {data.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="py-12 text-center text-gray-500"
              >
                No pending outpasses found.
              </td>
            </tr>
          )}

          {data.map((o) => (
            <tr
              key={o.id}
              className={`border-b last:border-none hover:bg-gray-50 transition ${
                selectedIds.includes(o.id)
                  ? "bg-red-50/40"
                  : ""
              }`}
            >
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(o.id)}
                  onChange={() => toggleRow(o.id)}
                />
              </td>

              <td className="px-5 py-4">
                <p className="font-semibold">{o.name}</p>
                <p className="text-xs text-gray-500">
                  {o.roll_no}
                </p>
                <p className="text-xs text-gray-400">
                  {o.department}
                </p>
              </td>

              <td className="px-5 py-4">
                {o.hostel}
              </td>

              <td className="px-5 py-4">
                {o.room || "-"}
              </td>

              <td className="px-5 py-4">
                <span className="px-2 py-1 rounded bg-gray-100 text-xs">
                  {o.outpass_type}
                </span>
              </td>

              <td className="px-5 py-4 text-sm">
                {new Date(
                  o.departure_datetime
                ).toLocaleString("en-IN")}
              </td>

              <td className="px-5 py-4 text-sm text-gray-500">
                {new Date(
                  o.updated_at
                ).toLocaleString("en-IN")}
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onView(o)}
                    className="px-3 py-2 rounded-lg border hover:bg-gray-100 text-sm"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onApprove(o.id)}
                    className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => onReject(o.id)}
                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}