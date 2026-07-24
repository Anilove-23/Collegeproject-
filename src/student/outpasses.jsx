import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateOutpass from "./CreateOutpasses";
import CancelOutpass from "./Canceloutpass";
import { apiFetch } from "../utils/api";

export default function OutpassLayout() {
  const navigate = useNavigate();

  const [active, setActive] = useState("my");
  const [selected, setSelected] = useState(null);
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6; // Number of items per page

  /* ================= LOGOUT ================= */
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/signin";
  }

  /* ================= FETCH ================= */
  async function fetchOutpasses() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/api/outpasses/my");
      console.log(data);

      setOutpasses(data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch outpasses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOutpasses();
  }, []);

  /* ================= FILTER & PAGINATE ================= */
  const filteredOutpasses = useMemo(() => {
    if (filter === "All") return outpasses;
    return outpasses.filter(
      (o) => o.outp_status?.toLowerCase() === filter.toLowerCase()
    );
  }, [outpasses, filter]);

  // Calculate pagination details dynamically
  const totalItems = filteredOutpasses.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedOutpasses = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredOutpasses.slice(startIndex, startIndex + limit);
  }, [filteredOutpasses, page, limit]);

  // Reset page to 1 when filter changes
  const handleFilterChange = (status) => {
    setFilter(status);
    setPage(1);
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-80 bg-gradient-to-b from-[#6d0f16] to-[#8b0f18] text-white flex flex-col shadow-2xl z-10">
        {/* HEADER */}
        <div className="p-8 border-b border-white/10">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            🎓 Outpass
          </h1>
          <p className="text-white/70 mt-1.5 text-xs font-medium tracking-wide uppercase">
            Hostel Management Portal
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-5 space-y-2">
          <NavItem
            title="My Outpasses"
            active={active === "my"}
            onClick={() => setActive("my")}
          />
          <NavItem
            title="Create Outpass"
            active={active === "create"}
            onClick={() => setActive("create")}
          />
          <NavItem
            title="Cancel Outpass"
            active={active === "cancel"}
            onClick={() => setActive("cancel")}
          />
          <NavItem
            title="Complaints"
            active={false}
            onClick={() => navigate("/complaint")}
          />
        </nav>

        {/* LOGOUT */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] font-semibold py-3 rounded-2xl transition-all duration-200 border border-white/20 shadow-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium">Loading outpasses...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ================= DASHBOARD ================= */}
        {!loading && active === "my" && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#6d0f16] tracking-tight">
                  Student Dashboard
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Track and manage your hostel leave requests
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold text-[#6d0f16]">
                    {outpasses.length}
                  </p>
                </div>
              </div>
            </div>

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <DashboardCard
                title="Total"
                value={outpasses.length}
                subtitle="All requests created"
              />
              <DashboardCard
                title="Pending"
                value={
                  outpasses.filter(
                    (o) => o.outp_status?.toLowerCase() === "pending"
                  ).length
                }
                subtitle="Waiting for approval"
              />
              <DashboardCard
                title="Approved"
                value={
                  outpasses.filter(
                    (o) => o.outp_status?.toLowerCase() === "approved"
                  ).length
                }
                subtitle="Ready for checkout"
              />
              <DashboardCard
                title="Rejected"
                value={
                  outpasses.filter(
                    (o) => o.outp_status?.toLowerCase() === "rejected"
                  ).length
                }
                subtitle="Declined requests"
              />
            </div>

            {/* FILTERS */}
            <div className="flex gap-2.5 mb-4 flex-wrap">
              {["All", "Pending", "Approved", "Rejected"].map((status) => {
                const count =
                  status === "All"
                    ? outpasses.length
                    : outpasses.filter(
                        (o) =>
                          o.outp_status?.toLowerCase() === status.toLowerCase()
                      ).length;

                return (
                  <button
                    key={status}
                    onClick={() => handleFilterChange(status)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 ${
                      filter === status
                        ? "bg-[#6d0f16] text-white border-[#6d0f16] shadow-md"
                        : "bg-white hover:bg-gray-100 text-gray-600 border-gray-200 shadow-sm"
                    }`}
                  >
                    <span>{status}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        filter === status
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TABLE WITH INTEGRATED PAGINATION */}
            <MyOutpasses
              outpasses={paginatedOutpasses}
              setSelected={setSelected}
              totalItems={totalItems}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </div>
        )}

        {/* CREATE TAB */}
        {active === "create" && (
          <CreateOutpass
            setActive={setActive}
            fetchOutpasses={fetchOutpasses}
          />
        )}

        {/* CANCEL TAB */}
        {active === "cancel" && (
          <CancelOutpass
            outpasses={outpasses}
            setOutpasses={setOutpasses}
            setActive={setActive}
            fetchOutpasses={fetchOutpasses}
          />
        )}

        {/* MODAL */}
        {selected && (
          <OutpassModal
            outpass={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </main>
    </div>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({ title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-between ${
        active
          ? "bg-white text-[#6d0f16] shadow-lg font-semibold"
          : "hover:bg-white/10 text-white/90"
      }`}
    >
      <span>{title}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#6d0f16]"></span>}
    </button>
  );
}

/* ================= DASHBOARD CARD ================= */
function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-[#6d0f16] mt-2">
            {value}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#f8eaea] flex items-center justify-center text-[#6d0f16] text-lg">
          📋
        </div>
      </div>
    </div>
  );
}

/* ================= TABLE COMPONENT ================= */
function MyOutpasses({
  outpasses,
  setSelected,
  totalItems,
  page,
  totalPages,
  setPage,
}) {
  if (!outpasses || outpasses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 font-medium">
        No outpasses found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4 pl-6">ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {outpasses.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50/60 transition">
                <td className="p-4 pl-6 font-bold text-gray-900">OP-{o.id}</td>
                <td className="p-4 font-medium">{o.outpass_type}</td>
                <td className="p-4 font-medium text-gray-800">
                  {o.place_of_visit}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                      o.outp_status?.toLowerCase() === "approved"
                        ? "bg-green-100 text-green-700"
                        : o.outp_status?.toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.outp_status}
                  </span>
                </td>
                <td className="p-4 text-right pr-6">
                  <button
                    onClick={() => setSelected(o)}
                    className="bg-[#6d0f16] hover:bg-[#560c12] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION CONTROLS ================= */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-gray-500 font-medium">
          Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
          <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} items total)
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
          >
            Previous
          </button>

          <span className="text-xs font-semibold px-2 text-gray-600">
            {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */
function OutpassModal({ outpass, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-7 relative border border-gray-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center text-sm transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#6d0f16] mb-6 flex items-center gap-2">
          <span>📄</span> Outpass Details
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Detail label="Type" value={outpass.outpass_type} />
          <Detail label="Place" value={outpass.place_of_visit} />
          <Detail label="Purpose" value={outpass.purpose} />
          <Detail
            label="Departure"
            value={
              outpass.departure_datetime
                ? new Date(outpass.departure_datetime).toLocaleString("en-IN")
                : "-"
            }
          />
          <Detail
            label="Arrival"
            value={
              outpass.arrival_datetime
                ? new Date(outpass.arrival_datetime).toLocaleString("en-IN")
                : "-"
            }
          />
          <Detail label="Status" value={outpass.outp_status} />
        </div>
      </div>
    </div>
  );
}

/* ================= DETAIL COMPONENT ================= */
function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <p className="font-semibold text-sm text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  );
}