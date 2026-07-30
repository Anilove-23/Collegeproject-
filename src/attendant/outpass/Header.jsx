import React from "react";

export default function Header({
  title,
  subtitle,
  total,
  onRefresh,
  buttonColor = "bg-[#6d0f16]",
  buttonLabel = "Total",
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#6d0f16]">
          {title}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
        >
          Refresh
        </button>

        <button
          className={`px-4 py-2 rounded-lg text-white text-sm ${buttonColor}`}
        >
          {buttonLabel} : {total}
        </button>
      </div>
    </div>
  );
}