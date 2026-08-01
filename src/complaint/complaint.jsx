import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintForm from "./ComplaintForm"; // We will adapt ComplaintForm to be rendered as a component similar to CreateOutpass

export default function ComplaintLayout() {
  const navigate = useNavigate();

  const [active, setActive] = useState("my"); // 'my' | 'create' | 'global'
  const [selected, setSelected] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [globalComplaints, setGlobalComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const [upvotedItems, setUpvotedItems] = useState([]);

  /* ================= MOBILE DRAWER STATE ================= */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6; // Number of items per page

  /* ================= LOGOUT ================= */
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  /* ================= FETCH ================= */
  async function fetchComplaints() {
    try {
      setLoading(true);
      setError("");

      let token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }

      if (!token || !userStr) {
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);

      const response = await fetch('http://localhost:5000/complaint/my-complaints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch my complaints');

      const data = await response.json();
      setComplaints(data.complaints || []);
      
      const globalResponse = await fetch('http://localhost:5000/complaint/hostel-complaints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student'
        }
      });

      if (!globalResponse.ok) throw new Error('Failed to fetch global complaints');

      const globalData = await globalResponse.json();
      setGlobalComplaints(globalData.complaints || []);
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComplaints();
  }, [navigate]);

  /* ================= UPVOTE ================= */
  const handleUpvote = async (complaintId) => {
    let token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
    const user = userStr ? JSON.parse(userStr) : {};

    try {
      setUpvotedItems(prev => [...prev, complaintId]);
      
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c
      ));
      
      setGlobalComplaints(globalComplaints.map(c => 
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c
      ));

      const response = await fetch('http://localhost:5000/complaint/upvote', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student'
        },
        body: JSON.stringify({ complaint_id: complaintId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upvote');
      }
    } catch (err) {
      console.error(err);
      setUpvotedItems(prev => prev.filter(id => id !== complaintId));
      
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 1) - 1 } : c
      ));
      
      setGlobalComplaints(globalComplaints.map(c => 
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 1) - 1 } : c
      ));
      
      alert(err.message || "Failed to register upvote. Please try again.");
    }
  };

  /* ================= FILTER & PAGINATE ================= */
  const activeDataset = active === "global" ? globalComplaints : complaints;

  const filteredComplaints = useMemo(() => {
    if (filter === "All") return activeDataset;
    return activeDataset.filter(
      (c) => c.status?.toLowerCase() === filter.toLowerCase()
    );
  }, [activeDataset, filter]);

  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedComplaints = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredComplaints.slice(startIndex, startIndex + limit);
  }, [filteredComplaints, page, limit]);

  const handleFilterChange = (status) => {
    setFilter(status);
    setPage(1);
  };

  /* ================= NAV SELECT ================= */
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
          Complaint Portal
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
              🛠️ Complaints
            </h1>
            <p className="text-white/70 mt-1.5 text-xs font-medium tracking-wide uppercase">
              Hostel Management Portal
            </p>
          </div>

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
            title="My Complaints"
            active={active === "my"}
            onClick={() => handleNavSelect("my")}
            icon={<IconList />}
          />
          <NavItem
            title="Global Complaints"
            active={active === "global"}
            onClick={() => handleNavSelect("global")}
            icon={<IconGlobe />}
          />
          <NavItem
            title="Raise Complaint"
            active={active === "create"}
            onClick={() => handleNavSelect("create")}
            icon={<IconPlus />}
          />
          <NavItem
            title="Outpass Portal"
            active={false}
            onClick={() => {
              setDrawerOpen(false);
              navigate("/student");
            }}
            icon={<IconOutpass />}
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
              className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin"
            ></div>
            <p className="font-medium text-sm sm:text-base">Loading complaints...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={fetchComplaints}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= DASHBOARD ================= */}
        {!loading && (active === "my" || active === "global") && (
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-5 sm:pb-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#6d0f16] tracking-tight">
                  {active === "global" ? "Hostel Complaints" : "My Complaints"}
                </h2>
                <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                  {active === "global" 
                    ? "View and upvote issues reported in your hostel"
                    : "Track and manage your hostel issues"}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-sm flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Total Upvotes
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#6d0f16]">
                    {activeDataset.reduce((acc, c) => acc + (c.upvotes || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 auto-rows-fr">
              <DashboardCard
                title="Total"
                value={activeDataset.length}
                subtitle={active === "global" ? "All reported issues" : "All complaints filed"}
                icon="📝"
              />
              <DashboardCard
                title="Unresolved"
                value={
                  activeDataset.filter(
                    (c) => c.status?.toLowerCase() === "pending"
                  ).length
                }
                subtitle="Awaiting action"
                icon="⏳"
              />
              <DashboardCard
                title="Resolved"
                value={
                  activeDataset.filter(
                    (c) => c.status?.toLowerCase() === "resolved"
                  ).length
                }
                subtitle="Closed tickets"
                icon="✅"
              />
            </div>

            {/* FILTERS */}
            <div className="flex gap-2.5 mb-2 sm:mb-4 flex-wrap">
              {["All", "Pending", "Resolved"].map((status) => {
                const count =
                  status === "All"
                    ? activeDataset.length
                    : activeDataset.filter(
                        (c) =>
                          c.status?.toLowerCase() === status.toLowerCase()
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
            <MyComplaints
              complaints={paginatedComplaints}
              setSelected={setSelected}
              totalItems={totalItems}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              isGlobal={active === "global"}
              onUpvote={handleUpvote}
              upvotedItems={upvotedItems}
            />
          </div>
        )}

        {/* CREATE TAB */}
        {active === "create" && (
          <ComplaintForm 
            onSuccess={async () => {
              await fetchComplaints();
              setActive("my");
            }}
            onCancel={() => setActive("my")}
          />
        )}

        {/* MODAL */}
        {selected && (
          <ComplaintModal
            complaint={selected}
            onClose={() => setSelected(null)}
            onUpvote={() => handleUpvote(selected.id)}
            isUpvoted={upvotedItems.includes(selected.id)}
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

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
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

function IconOutpass() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
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
function DashboardCard({ title, value, subtitle, icon }) {
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
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  const styles =
    normalized === "resolved"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${styles}`}>
      {status}
    </span>
  );
}

/* ================= TABLE / CARD COMPONENT ================= */
function MyComplaints({
  complaints,
  setSelected,
  totalItems,
  page,
  totalPages,
  setPage,
  isGlobal,
  onUpvote,
  upvotedItems,
}) {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center text-gray-400 font-medium">
        No complaints found
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
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Upvotes</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/60 transition">
                <td className="p-4 pl-6 font-bold text-gray-900">CMP-{c.id}</td>
                <td className="p-4 font-medium text-gray-800">{c.title || 'Untitled'}</td>
                <td className="p-4 font-medium">{c.type}</td>
                <td className="p-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-4 font-bold text-[#6d0f16]">
                  {isGlobal && c.status === 'pending' ? (
                    <button
                      onClick={() => onUpvote(c.id)}
                      disabled={upvotedItems.includes(c.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-[#6d0f16] ${
                        upvotedItems.includes(c.id)
                          ? 'bg-red-50 text-red-800 border-red-200 cursor-not-allowed opacity-80'
                          : 'bg-white text-[#6d0f16] border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
                      }`}
                    >
                      <span>👍</span> {c.upvotes || 0}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#6d0f16] px-2.5 py-1.5 rounded-lg text-xs">
                      <span>👍</span> {c.upvotes || 0}
                    </span>
                  )}
                </td>
                <td className="p-4 text-right pr-6">
                  <button
                    onClick={() => setSelected(c)}
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
        {complaints.map((c) => (
          <div key={c.id} className="p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-sm">CMP-{c.id}</span>
              <StatusBadge status={c.status} />
            </div>

            <div className="text-sm text-gray-600 space-y-0.5 mt-1">
              <p className="font-semibold text-gray-800">{c.title}</p>
              <p>
                <span className="text-gray-500 text-xs">Type: </span>
                {c.type}
              </p>
            </div>

            <div className="flex justify-between items-center mt-2">
              {isGlobal && c.status === 'pending' ? (
                <button
                  onClick={() => onUpvote(c.id)}
                  disabled={upvotedItems.includes(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-[#6d0f16] ${
                    upvotedItems.includes(c.id)
                      ? 'bg-red-50 text-red-800 border-red-200 cursor-not-allowed opacity-80'
                      : 'bg-white text-[#6d0f16] border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-sm'
                  }`}
                >
                  <span>👍</span> {c.upvotes || 0}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6d0f16] bg-red-50 px-2.5 py-1.5 rounded-lg">
                  <span>👍</span> {c.upvotes || 0}
                </span>
              )}
              <button
                onClick={() => setSelected(c)}
                className="bg-[#6d0f16] hover:bg-[#560c12] active:bg-[#4a0a0f] text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-1"
              >
                View
              </button>
            </div>
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
function ComplaintModal({ complaint, onClose, onUpvote, isUpvoted }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">
        {/* Sticky header with close button */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-7 pb-4 border-b border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-[#6d0f16] flex items-center gap-2">
            <span>📄</span> Complaint Details
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
          <div className="col-span-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{complaint.title || 'Untitled Complaint'}</h3>
            <div className="flex gap-2">
              <StatusBadge status={complaint.status} />
              {complaint.type && (
                <span className="inline-block bg-[#f8eaea] text-[#6d0f16] text-xs font-bold px-2 py-1 rounded-full">
                  {complaint.type}
                </span>
              )}
            </div>
          </div>
          
          <div className="col-span-full mt-2">
            <Detail label="Description" value={complaint.description} />
          </div>

          {complaint.status === 'resolved' && (
            <div className="col-span-full mt-2 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Resolution Update:</p>
              <p className="text-sm text-emerald-700">
                {complaint.resolved_description || "This issue has been marked as resolved by the administration."}
              </p>
              {complaint.resolved_at && (
                <span className="text-xs font-medium text-emerald-600 block mt-2">
                  Resolved on: {new Date(complaint.resolved_at).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}

          <div className="col-span-full flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500">
              Filed on: {new Date(complaint.date_created).toLocaleString("en-IN")}
            </p>
            {complaint.status === 'pending' && (
              <button 
                onClick={onUpvote}
                disabled={isUpvoted}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d0f16] ${
                  isUpvoted
                    ? 'bg-red-50 text-red-800 border border-red-200 cursor-not-allowed opacity-80'
                    : 'bg-white text-[#6d0f16] border border-gray-200 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span>👍</span> 
                {isUpvoted ? 'Upvoted' : 'Upvote'} ({complaint.upvotes || 0})
              </button>
            )}
          </div>
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
      <p className="font-semibold text-sm text-gray-800 whitespace-pre-wrap break-words">
        {value || "-"}
      </p>
    </div>
  );
}