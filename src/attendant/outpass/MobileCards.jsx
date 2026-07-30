import React from "react";
import RowActions from "./RowActions";

export default function MobileCards({
  data = [],
  status,
  onView,
  onApprove,
  onReject,
  emptyMessage = "No records found",
}) {
  if (data.length === 0) {
    return (
      <div className="lg:hidden bg-white border rounded-2xl p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="lg:hidden space-y-4">
      {data.map((o) => (
        <div
          key={o.outpass_id || o.id}
          className="bg-white border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-lg">
                {o.name}
              </h2>

              <p className="text-sm text-gray-500">
                {o.roll_no}
              </p>

              <p className="text-xs text-gray-400">
                {o.department}
              </p>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
            <Info label="Hostel" value={o.hostel} />
            <Info label="Room" value={o.room} />
            <Info label="Type" value={o.outpass_type} />
            <Info
              label="Departure"
              value={new Date(
                o.departure_datetime
              ).toLocaleString("en-IN")}
            />
          </div>

          <div className="mt-5">
            <RowActions
              status={status}
              outpass={o}
              onView={onView}
              onApprove={onApprove}
              onReject={onReject}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}