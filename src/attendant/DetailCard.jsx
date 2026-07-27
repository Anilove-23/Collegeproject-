import React from "react";

export default function DetailCard({
  label,
  value,
  type,
  field,
}) {

  /* ================= TYPE ================= */

  const normalizedType =
    String(type || "")
      .toLowerCase();

  const isLocal =
    normalizedType === "local";

  const isOutstation =
    normalizedType === "outstation";

  /* ================= HIDE RULES ================= */

  // Local outpass does not need place
  if (
    isLocal &&
    field === "place"
  ) {

    return null;
  }

  // Hide empty values safely
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;
  }

  /* ================= DATE FORMAT ================= */

  const isDateField =
    field === "departure" ||
    field === "arrival";

  const formattedValue =
    isDateField
      ? new Date(value).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : value;

  /* ================= STATUS COLORS ================= */

  const isStatus =
    field === "status";

  const status =
    String(value || "")
      .toLowerCase();

  const statusStyle =
    status === "approved"
      ? "bg-green-100 text-green-700"

      : status === "pending"
      ? "bg-yellow-100 text-yellow-700"

      : status === "rejected"
      ? "bg-red-100 text-red-700"

      : "bg-gray-100 text-gray-700";

  return (

    <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">

      {/* LABEL */}

      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">

        {label}

      </p>

      {/* STATUS */}

      {isStatus ? (

        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}
        >

          {value}

        </span>

      ) : (

        <p className="font-semibold text-sm text-gray-800 break-words leading-relaxed">

          {formattedValue || "-"}

        </p>

      )}

      {/* TYPE BADGE */}

      {field === "type" && (

        <div className="mt-3">

          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
            ${
              isLocal

                ? "bg-blue-100 text-blue-700"

                : isOutstation

                ? "bg-purple-100 text-purple-700"

                : "bg-gray-100 text-gray-700"
            }`}
          >

            {value}

          </span>

        </div>
      )}

    </div>
  );
}