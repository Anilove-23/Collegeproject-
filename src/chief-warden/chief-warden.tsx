import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

/* ================= TYPES ================= */

interface Hostel {
  id?: string;
  hostel_name?: string;
  name?: string;
}

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
  student_phone?: string;
  student_department?: string;
  date_created: string;
}

/* ================= COMPONENT ================= */

function Warden() {
  const navigate = useNavigate();

  /* ================= STATES ================= */

  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<"outpasses" | "complaints">("outpasses");

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [hostelFilter, setHostelFilter] = useState("All");

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 8; // Items per page

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchDashboard();
    fetchComplaints();
    fetchHostels();
  }, []);

  /* ================= FETCH DASHBOARD ================= */

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const response: any = await apiFetch("/api/outpasses/monitor");
      console.log("Warden Dashboard Raw Response:", response);

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.outpasses)
        ? response.data.outpasses
        : Array.isArray(response?.outpasses)
        ? response.outpasses
        : [];

      setOutpasses(list);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load dashboard");
      setOutpasses([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= FETCH COMPLAINTS ================= */

  async function fetchComplaints() {
    try {
      const response: any = await apiFetch("/complaint/all");

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.complaints)
        ? response.complaints
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.complaints)
        ? response.data.complaints
        : [];

      setComplaints(list);
    } catch (err) {
      console.error("COMPLAINT FETCH ERROR:", err);
      setComplaints([]);
    }
  }

  /* ================= FETCH HOSTELS ================= */

  async function fetchHostels() {
    try {
      const response: any = await apiFetch("/api/hostels");

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.hostels)
        ? response.hostels
        : [];

      setHostels(list);
    } catch (err) {
      console.error("HOSTEL FETCH ERROR:", err);
      setHostels([]);
    }
  }

  /* ================= LOGOUT ================= */

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  /* ================= STATUS ================= */

  function getStatus(pass: Outpass) {
    if (pass.std_status === "Out") {
      return {
        label: "Outside Campus",
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

  /* ================= FILTER & PAGINATE OUTPASSES ================= */

  const filteredOutpasses = useMemo(() => {
    const safeOutpasses = Array.isArray(outpasses) ? outpasses : [];

    return safeOutpasses.filter((pass: Outpass) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        pass.name?.toLowerCase().includes(q) ||
        pass.roll_no?.toLowerCase().includes(q) ||
        pass.phone?.includes(q) ||
        pass.department?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" || pass.outp_status === statusFilter;

      const matchesHostel =
        hostelFilter === "All" || pass.hostel === hostelFilter;

      return matchesSearch && matchesStatus && matchesHostel;
    });
  }, [outpasses, search, statusFilter, hostelFilter]);

  /* ================= FILTER & PAGINATE COMPLAINTS ================= */

  const filteredComplaints = useMemo(() => {
    const safeComplaints = Array.isArray(complaints) ? complaints : [];

    return safeComplaints.filter((comp: Complaint) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        comp.student_name?.toLowerCase().includes(q) ||
        comp.student_roll_no?.toLowerCase().includes(q) ||
        comp.title?.toLowerCase().includes(q) ||
        comp.description?.toLowerCase().includes(q);

      const matchesHostel =
        hostelFilter === "All" || comp.hostel === hostelFilter;

      return matchesSearch && matchesHostel;
    });
  }, [complaints, search, hostelFilter]);

  // Dynamic Pagination calculations based on Active Tab
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

  // Reset page when switching tabs or applying filters
  const handleTabSwitch = (tab: "outpasses" | "complaints") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleFilterChange = (setter: any, val: any) => {
    setter(val);
    setPage(1);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* ================= NAVBAR ================= */}

      <div className="bg-[#6d0f16] text-white px-8 py-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="/l.png"
            alt="logo"
            className="w-10 h-10 object-contain brightness-200"
          />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Chief Warden Dashboard
            </h1>
            <p className="text-xs text-white/70">
              Hostel Movement & Complaint Monitoring System
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] px-4 py-2 rounded-xl text-xs font-semibold transition border border-white/20 shadow-xs cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* ================= FILTERS ================= */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, roll no, or phone..."
                value={search}
                onChange={(e) =>
                  handleFilterChange(setSearch, e.target.value)
                }
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
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

            <select
              value={hostelFilter}
              onChange={(e) =>
                handleFilterChange(setHostelFilter, e.target.value)
              }
              className="bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
            >
              <option value="All">All Hostels</option>
              {(Array.isArray(hostels) ? hostels : []).map((hostel) => {
                const hostelName =
                  hostel.name || hostel.hostel_name || "Unknown";

                return (
                  <option
                    key={hostel.id || hostelName}
                    value={hostelName}
                  >
                    {hostelName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* ================= TABS ================= */}

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

        {/* ================= ERROR ================= */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-xs text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* ================= OUTPASS TABLE ================= */}

        {activeTab === "outpasses" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#6d0f16]">
                Student Outpass Records
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                {filteredOutpasses.length} Records Total
              </span>
            </div>

            {filteredOutpasses.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No outpass records found matching criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Hostel</th>
                      <th className="px-6 py-3.5">Destination</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedOutpasses.map((pass: Outpass) => {
                      const status = getStatus(pass);

                      return (
                        <tr
                          key={pass.id}
                          className="hover:bg-gray-50/80 transition"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {pass.name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {pass.roll_no}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs font-medium text-gray-600">
                            {pass.department || "-"}
                          </td>

                          <td className="px-6 py-4 text-xs font-medium text-gray-600">
                            {pass.hostel || "-"}
                          </td>

                          <td className="px-6 py-4 text-xs font-medium text-gray-600">
                            {pass.place_of_visit || "-"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-700 text-[11px] px-3 py-1 rounded-full font-semibold">
                              {pass.outpass_type}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`text-[11px] px-3 py-1 rounded-full font-semibold border ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                            {pass.created_at
                              ? new Date(pass.created_at).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}
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

        {/* ================= COMPLAINT TABLE ================= */}

        {activeTab === "complaints" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#6d0f16]">
                Hostel Complaints
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                {filteredComplaints.length} Complaints Total
              </span>
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No complaints found matching criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Hostel</th>
                      <th className="px-6 py-3.5">Complaint</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedComplaints.map((comp: Complaint) => (
                      <tr
                        key={comp.id}
                        className="hover:bg-gray-50/80 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {comp.student_name || "-"}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {comp.student_roll_no || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                          {comp.hostel || "-"}
                        </td>

                        <td className="px-6 py-4 max-w-md">
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">
                              {comp.title || "Complaint"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {comp.description}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-[11px] px-3 py-1 rounded-full font-semibold border ${
                              comp.status === "resolved"
                                ? "bg-green-100 text-green-800 border-green-200/60"
                                : "bg-amber-100 text-amber-800 border-amber-200/60"
                            }`}
                          >
                            {comp.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                          {comp.date_created
                            ? new Date(comp.date_created).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= PAGINATION CONTROLS ================= */}

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
      </div>
    </div>
  );
}

export default Warden;