import React from "react";

export default function HistoryTable({
  data,
  statusColor = "bg-green-100 text-green-700",
  onView,
  emptyMessage = "No records found",
}) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-5 py-4">Student</th>
            <th className="px-5 py-4">Hostel</th>
            <th className="px-5 py-4">Room</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Departure</th>
            <th className="px-5 py-4">Updated</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="text-center py-12 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {data.map((o) => (
            <tr
              key={o.id}
              className="border-b last:border-none hover:bg-gray-50"
            >
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
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                >
                  {o.outp_status}
                </span>
              </td>

              <td className="px-5 py-4 text-center">
                <button
                  onClick={() => onView(o)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-100 text-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}