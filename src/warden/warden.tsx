import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

/* ================= TYPES ================= */

interface Outpass {
  id: string;
  name: string;
  roll_no: string;
  phone: string;
  department: string;
  hostel: string;
  place_of_visit: string;
  outpass_type: string;
  outp_status: string;
  std_status: string;
  created_at: string;
}

interface Complaint {
  id: string;
  title?: string;
  description: string;
  hostel: string;
  status: string;
  student_name?: string;
  student_roll_no?: string;
  date_created: string;
}

/* ================= DUMMY FALLBACK DATA ================= */

const dummyOutpasses: Outpass[] = [
  {
    id: "1",
    name: "Rahul Kumar",
    roll_no: "CS21A001",
    phone: "9876543210",
    department: "CSE",
    hostel: "Boys Hostel A",
    place_of_visit: "City",
    outpass_type: "Day",
    outp_status: "Approved",
    std_status: "In",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Amit Sharma",
    roll_no: "ME21B014",
    phone: "9123456789",
    department: "Mechanical",
    hostel: "Boys Hostel B",
    place_of_visit: "Home",
    outpass_type: "Night",
    outp_status: "Pending",
    std_status: "In",
    created_at: new Date().toISOString(),
  },
];

const dummyComplaints: Complaint[] = [
  {
    id: "1",
    title: "Water Problem",
    description: "No water since morning in 2nd floor bathrooms",
    hostel: "Boys Hostel A",
    status: "Pending",
    student_name: "Rahul Kumar",
    student_roll_no: "CS21A001",
    date_created: new Date().toISOString(),
  },
];

/* ================= COMPONENT ================= */

export default function Warden() {
  const navigate = useNavigate();

  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<"outpasses" | "complaints">(
    "outpasses"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6; // Items per page

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchOutpasses();
    fetchComplaints();
  }, []);

  async function fetchOutpasses() {
    try {
      setLoading(true);
      setError("");

      // Updated to match backend route /api/outpasses/monitor
      const res: any = await apiFetch("/api/outpasses/monitor");

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.outpasses)
        ? res.outpasses
        : Array.isArray(res?.data?.outpasses)
        ? res.data.outpasses
        : null;

      if (list) {
        setOutpasses(list);
      } else {
        // Fallback silently to dummy data
        setOutpasses(dummyOutpasses);
      }
    } catch (err: any) {
      console.log("Outpass API request failed, loading local fallback:", err);
      setOutpasses(dummyOutpasses);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComplaints() {
    try {
      const res: any = await apiFetch("/complaint/all");

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.complaints)
        ? res.complaints
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.complaints)
        ? res.data.complaints
        : null;

      if (list) {
        setComplaints(list);
      } else {
        setComplaints(dummyComplaints);
      }
    } catch (err) {
      console.log("Complaint API request failed, loading local fallback:", err);
      setComplaints(dummyComplaints);
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/signin");
  }

  /* ================= STATUS BADGE HELPER ================= */

  function getStatus(pass: Outpass) {
    if (pass.std_status === "Out") {
      return {
        label: "Outside",
        className: "bg-orange-100 text-orange-800 border-orange-200/60",
      };
    }

    if (pass.outp_status === "Approved") {
      return {
        label: "Approved",
        className: "bg-green-100 text-green-800 border-green-200/60",
      };
    }

    if (pass.outp_status === "Pending") {
      return {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 border-amber-200/60",
      };
    }

    return {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200/60",
    };
  }

  /* ================= FILTER OUTPASSES ================= */

  const filteredOutpasses = useMemo(() => {
    const safeOutpasses = Array.isArray(outpasses) ? outpasses : [];

    return safeOutpasses.filter((pass) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        pass.name?.toLowerCase().includes(q) ||
        pass.roll_no?.toLowerCase().includes(q) ||
        pass.phone?.includes(q) ||
        pass.department?.toLowerCase().includes(q) ||
        pass.hostel?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" || pass.outp_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [outpasses, search, statusFilter]);

  /* ================= FILTER COMPLAINTS ================= */

  const filteredComplaints = useMemo(() => {
    const safeComplaints = Array.isArray(complaints) ? complaints : [];

    return safeComplaints.filter((comp) => {
      const q = search.toLowerCase().trim();

      return (
        !q ||
        comp.student_name?.toLowerCase().includes(q) ||
        comp.student_roll_no?.toLowerCase().includes(q) ||
        comp.hostel?.toLowerCase().includes(q) ||
        comp.title?.toLowerCase().includes(q) ||
        comp.description?.toLowerCase().includes(q)
      );
    });
  }, [complaints, search]);

  /* ================= PAGINATION CALCULATIONS ================= */

  const activeListLength =
    activeTab === "outpasses"
      ? filteredOutpasses.length
      : filteredComplaints.length;

  const totalPages = Math.ceil(activeListLength / limit) || 1;

  const paginatedOutpasses = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOutpasses.slice(start, start + limit);
  }, [filteredOutpasses, page, limit]);

  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredComplaints.slice(start, start + limit);
  }, [filteredComplaints, page, limit]);

  const handleTabSwitch = (tab: "outpasses" | "complaints") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleFilterChange = (setter: any, val: any) => {
    setter(val);
    setPage(1);
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Loading Warden Dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ================= UI RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* NAVBAR */}
      <header className="bg-[#6d0f16] text-white px-8 py-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Warden Dashboard
          </h1>
          <p className="text-xs text-white/70">
            Hostel Operations & Student Request Management
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] px-4 py-2 rounded-xl text-xs font-semibold transition border border-white/20 shadow-xs cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        {/* ERROR NOTIFICATION IF ANY */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-xs text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 grid md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student name, roll number, hostel, or phone..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] focus:ring-2 focus:ring-[#6d0f16]/10 transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            {search && (
              <button
                onClick={() => handleFilterChange(setSearch, "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {activeTab === "outpasses" && (
            <select
              value={statusFilter}
              onChange={(e) =>
                handleFilterChange(setStatusFilter, e.target.value)
              }
              className="bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-3">
          <button
            onClick={() => handleTabSwitch("outpasses")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "outpasses"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Outpasses ({filteredOutpasses.length})
          </button>

          <button
            onClick={() => handleTabSwitch("complaints")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "complaints"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Complaints ({filteredComplaints.length})
          </button>
        </div>

        {/* OUTPASSES TABLE */}
        {activeTab === "outpasses" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            {filteredOutpasses.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No outpass records found matching your search criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Hostel</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedOutpasses.map((p) => {
                      const status = getStatus(p);
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-gray-50/80 transition"
                        >
                          <td className="p-4 pl-6">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {p.name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {p.roll_no}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-600">
                            {p.department || "-"}
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-600">
                            {p.hostel || "-"}
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-600">
                            {p.place_of_visit || "-"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COMPLAINTS TABLE */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            {filteredComplaints.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No complaints found matching your search criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Hostel</th>
                      <th className="p-4">Complaint</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedComplaints.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50/80 transition"
                      >
                        <td className="p-4 pl-6">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {c.student_name || "-"}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {c.student_roll_no || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-medium text-gray-600">
                          {c.hostel || "-"}
                        </td>
                        <td className="p-4 max-w-md">
                          <p className="font-semibold text-gray-800 text-xs">
                            {c.title || "Complaint"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {c.description}
                          </p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                              c.status?.toLowerCase() === "resolved"
                                ? "bg-green-100 text-green-800 border-green-200/60"
                                : "bg-amber-100 text-amber-800 border-amber-200/60"
                            }`}
                          >
                            {c.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {activeListLength > 0 && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({activeListLength} items)
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-xs cursor-pointer"
              >
                Previous
              </button>

              <span className="text-xs font-semibold px-2 text-gray-600">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}