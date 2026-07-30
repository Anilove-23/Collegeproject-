import React from "react";

function Card({ title, value, color }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <h2 className={`text-2xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}

export default function Stats({
  total,
  page,
  totalPages,
  showing,
  color = "text-[#6d0f16]",
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Total"
        value={total}
        color={color}
      />

      <Card
        title="Current Page"
        value={page}
        color={color}
      />

      <Card
        title="Total Pages"
        value={totalPages}
        color={color}
      />

      <Card
        title="Showing"
        value={showing}
        color={color}
      />
    </div>
  );
}