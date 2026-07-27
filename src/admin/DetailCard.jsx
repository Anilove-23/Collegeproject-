import React from "react";

export default function DetailCard({ label, value, type, field }) {
  // field based control (important logic)
  const isMarket = type === "Market";
  const isHome = type === "Home";

  // ❌ Market rules
  if (isMarket && (field === "place" || field === "purpose")) {
    return null;
  }

  return (
    <div className="bg-gray-50 border p-3 rounded-lg shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-sm">{value || "-"}</p>
    </div>
  );
}