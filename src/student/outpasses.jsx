import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateOutpass from "./CreateOutpasses";
import CancelOutpass from "./Canceloutpass";
import { apiFetch } from "../utils/api";

const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export default function OutpassLayout() {
  const navigate = useNavigate();

  const [active, setActive] = useState("my");
  const [selected, setSelected] = useState(null);
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  /* ================= MOBILE DRAWER STATE ================= */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= ALLOCATION EVENT STATE ================= */
  const [allocationEvent, setAllocationEvent] = useState(null); // null = loading, false = none found

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

  /* ================= FETCH ALLOCATION EVENT ================= */
  async function fetchAllocationEvent() {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const studentYear = user?.current_year ?? user?.joining_year ?? null;
      if (!studentYear) { setAllocationEvent(false); return; }

      const res = await fetch(`http://localhost:5000/api/admin/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) { setAllocationEvent(false); return; }
      const data = await res.json();
      const events = data.events ?? data ?? [];
      // Find event for this student's year
      const match = Array.isArray(events)
        ? events.find(e => e.target_year === studentYear)
        : null;
      setAllocationEvent(match ?? false);
    } catch {
      setAllocationEvent(false);
    }
  }

  useEffect(() => {
    fetchOutpasses();
    fetchAllocationEvent();
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

  /* ================= NAV SELECT (closes mobile drawer) ================= */
  function handleNavSelect(tab) {
    setActive(tab);
    setDrawerOpen(false);
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 shadow-sm shrink-0">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-[#6d0f16] hover:bg-gray-100 active:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-[#6d0f16]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#6d0f16] tracking-tight">
          Student Outpass Portal
        </h1>
      </header>

      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 md:w-64 lg:w-80 bg-gradient-to-b from-[#6d0f16] to-[#8b0f18] text-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* HEADER */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              🎓 Outpass
            </h1>
            <p className="text-white/70 mt-1.5 text-xs font-medium tracking-wide uppercase">
              Hostel Management Portal
            </p>
          </div>

          {/* Close button, mobile only */}
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 sm:p-5 space-y-2 overflow-y-auto">
          <NavItem
            title="My Outpasses"
            active={active === "my"}
            onClick={() => handleNavSelect("my")}
            icon={<IconList />}
          />
          <NavItem
            title="Create Outpass"
            active={active === "create"}
            onClick={() => handleNavSelect("create")}
            icon={<IconPlus />}
          />
          <NavItem
            title="Cancel Outpass"
            active={active === "cancel"}
            onClick={() => handleNavSelect("cancel")}
            icon={<IconX />}
          />
          <NavItem
            title="Complaints"
            active={false}
            onClick={() => {
              setDrawerOpen(false);
              navigate("/complaint");
            }}
            icon={<IconMessage />}
          />
        </nav>

        {/* LOGOUT */}
        <div className="p-4 sm:p-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] font-semibold py-3 rounded-2xl transition-all duration-200 border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-12 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center space-y-3">
            <div
              role="status"
              aria-label="Loading outpasses"
              className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"
            ></div>
            <p className="font-medium text-sm sm:text-base">Loading outpasses...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={fetchOutpasses}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= DASHBOARD ================= */}
        {!loading && active === "my" && (
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-5 sm:pb-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#6d0f16] tracking-tight">
                  Student Dashboard
                </h2>
                <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                  Track and manage your hostel leave requests
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-sm flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Total Requests
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#6d0f16]">
                    {outpasses.length}
                  </p>
                </div>
              </div>
            </div>

            {/* ROOM ALLOCATION BANNER */}
            {(IS_DEV || allocationEvent) && (
              <div
                onClick={() => (IS_DEV || allocationEvent) && navigate('/allocation')}
                className={`flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 rounded-2xl border px-5 sm:px-6 py-4 shadow-sm transition-all duration-200 ${
                  IS_DEV || allocationEvent
                    ? 'bg-gradient-to-r from-[#6d0f16]/10 to-[#8b0f18]/5 border-[#6d0f16]/30 cursor-pointer hover:shadow-md hover:from-[#6d0f16]/20 hover:to-[#8b0f18]/10'
                    : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0 ${
                    IS_DEV || allocationEvent ? 'bg-[#6d0f16] text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      IS_DEV || allocationEvent ? 'text-[#6d0f16]' : 'text-gray-400'
                    }`}>
                      Room Allocation Dashboard
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {IS_DEV && !allocationEvent
                        ? '⚙️ Dev mode — no event found for your year yet'
                        : allocationEvent
                        ? `🗓 Allocation for Year ${allocationEvent.target_year} is scheduled`
                        : 'Room allocation has not been scheduled for your year yet'}
                    </p>
                  </div>
                </div>
                {(IS_DEV || allocationEvent) && (
                  <span className="text-[#6d0f16] font-bold text-sm flex items-center gap-1 shrink-0">
                    Open →
                  </span>
                )}
              </div>
            )}

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 auto-rows-fr">
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
            <div className="flex gap-2.5 mb-2 sm:mb-4 flex-wrap">
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
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1 ${
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

/* ================= SIDEBAR ICONS ================= */
function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({ title, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-white/60 ${
        active
          ? "bg-white text-[#6d0f16] shadow-lg font-semibold"
          : "hover:bg-white/10 text-white/90"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#6d0f16] shrink-0"></span>}
    </button>
  );
}

/* ================= DASHBOARD CARD ================= */
function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="h-full bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5">
      <div className="flex items-start justify-between h-full">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#6d0f16] mt-2">
            {value}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#f8eaea] flex items-center justify-center text-[#6d0f16] text-lg shrink-0">
          📋
        </div>
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  const styles =
    normalized === "approved"
      ? "bg-green-100 text-green-700"
      : normalized === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${styles}`}>
      {status}
    </span>
  );
}

/* ================= TABLE / CARD COMPONENT ================= */
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center text-gray-400 font-medium">
        No outpasses found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
      {/* ---- Desktop / tablet table ---- */}
      <div className="hidden md:block overflow-x-auto">
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
                  <StatusBadge status={o.outp_status} />
                </td>
                <td className="p-4 text-right pr-6">
                  <button
                    onClick={() => setSelected(o)}
                    className="bg-[#6d0f16] hover:bg-[#560c12] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile cards ---- */}
      <div className="md:hidden divide-y divide-gray-100">
        {outpasses.map((o) => (
          <div key={o.id} className="p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-sm">OP-{o.id}</span>
              <StatusBadge status={o.outp_status} />
            </div>

            <div className="text-sm text-gray-600 space-y-0.5">
              <p>
                <span className="font-semibold text-gray-800">Type: </span>
                {o.outpass_type}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Destination: </span>
                {o.place_of_visit}
              </p>
            </div>

            <button
              onClick={() => setSelected(o)}
              className="mt-1 self-start bg-[#6d0f16] hover:bg-[#560c12] active:bg-[#4a0a0f] text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1"
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* ================= PAGINATION CONTROLS ================= */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <p className="text-xs text-gray-500 font-medium text-center sm:text-left">
          Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
          <span className="font-bold text-gray-800">{totalPages}</span> ({totalItems} items total)
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="flex-1 sm:flex-none px-4 sm:px-3 py-2 sm:py-1.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1"
          >
            Previous
          </button>

          <span className="text-xs font-semibold px-2 text-gray-600 whitespace-nowrap">
            {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="flex-1 sm:flex-none px-4 sm:px-3 py-2 sm:py-1.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1"
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">
        {/* Sticky header with close button */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-7 pb-4 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-[#6d0f16] flex items-center gap-2">
            <span>📄</span> Outpass Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center text-sm transition focus:outline-none focus:ring-2 focus:ring-[#6d0f16]"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-5 sm:p-7 overflow-y-auto grid sm:grid-cols-2 gap-4">
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