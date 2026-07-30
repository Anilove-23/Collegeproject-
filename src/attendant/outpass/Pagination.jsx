import React from "react";

export default function Pagination({
  page,
  setPage,
  pagination,
  limit = 10,
  label = "items",
  color = "bg-[#6d0f16]",
}) {
  const start =
    pagination.total === 0
      ? 0
      : (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    pagination.total
  );

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

      <div className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-black mx-1">
          {start}
        </span>
        -
        <span className="font-semibold text-black mx-1">
          {end}
        </span>
        of
        <span className="font-semibold text-black mx-1">
          {pagination.total}
        </span>
        {label && <> {label}</>}
      </div>

      <div className="flex items-center gap-2">

        <button
          disabled={!pagination.hasPrevPage}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        {Array.from(
          { length: pagination.totalPages || 1 },
          (_, i) => i + 1
        )
          .slice(
            Math.max(page - 3, 0),
            Math.min(page + 2, pagination.totalPages)
          )
          .map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm transition ${
                page === p
                  ? `${color} text-white`
                  : "border hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>

      </div>
    </div>
  );
}