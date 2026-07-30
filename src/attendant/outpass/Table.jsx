import React from "react";
import RowActions from "./RowActions";

export default function Table({
  data = [],
  status,
  onView,
  onApprove,
  onReject,
  emptyMessage = "No records found",

  selectable = false,
  selectedRows = [],
  toggleRow,
  toggleAll,
}) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-sm text-gray-600">
            {selectable && (
              <th className="px-5 py-4">
                <input
                  type="checkbox"
                  checked={
                    data.length > 0 &&
                    selectedRows.length === data.length
                  }
                  onChange={toggleAll}
                />
              </th>
            )}

            <th className="px-5 py-4">Student</th>
            <th className="px-5 py-4">Hostel</th>
            <th className="px-5 py-4">Room</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Departure</th>
            <th className="px-5 py-4">Updated</th>
            <th className="px-5 py-4 text-center">
              Status
            </th>
            <th className="px-5 py-4 text-center">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={selectable ? 9 : 8}
                className="text-center py-12 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {data.map((o) => (
            <tr
              key={o.outpass_id || o.id}
              className="border-b hover:bg-gray-50 transition"
            >
              {selectable && (
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(
                      o.outpass_id || o.id
                    )}
                    onChange={() =>
                      toggleRow(o.outpass_id || o.id)
                    }
                  />
                </td>
              )}

              <td className="px-5 py-4">
                <div>
                  <p className="font-semibold">
                    {o.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {o.roll_no}
                  </p>

                  <p className="text-xs text-gray-400">
                    {o.department}
                  </p>
                </div>
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

              <td className="px-5 py-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {status}
                </span>
              </td>

              <td className="px-5 py-4">
                <RowActions
                  status={status}
                  outpass={o}
                  onView={onView}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}