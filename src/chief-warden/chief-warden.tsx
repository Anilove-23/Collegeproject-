import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= TYPES ================= */

interface Hostel {
  id?: string;
  hostel_name?: string;
  name?: string;
}

interface Outpass {
  id: string;
  student_id: string;
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
  departure_datetime?: string;
  arrival_datetime?: string;
}

interface Complaint {
  id: string;
  title?: string;
  description: string;
  hostel: string;
  status: string;
  student_id?: string;
  student_name?: string;
  student_roll_no?: string;
  student_phone?: string;
  student_department?: string;
  date_created: string;
}

interface LateLog {
  id: string;
  student_id: string;
  name: string;
  roll_no: string;
  department: string;
  hostel?: string;
  place_of_visit?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  actual_arrival?: string;
  std_status?: string;
  created_at?: string;
  outpass_type?: string;
}

interface StudentHistory {
  profile: any;
  outpasses: Outpass[];
  visit_logs: any[];
  complaints: Complaint[];
}

/* ================= COMPONENT ================= */

function Warden() {
  const navigate = useNavigate();

  /* ================= STATES ================= */

  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState<Complaint[]>([]);
  const [lateLogs, setLateLogs] = useState<LateLog[]>([]);
  const [activeTab, setActiveTab] = useState<"outpasses" | "complaints" | "escalated" | "lateLogs">("outpasses");

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [hostelFilter, setHostelFilter] = useState("All");
  const [campusFilter, setCampusFilter] = useState("All"); // "All", "Outside", "Inside"
  
  /* ================= DYNAMIC TIME RANGE & DATE CONSTRAINTS ================= */
  const [fromTime, setFromTime] = useState("20:00"); // Start time (Default 8:00 PM)
  const [toTime, setToTime] = useState(""); // End time (Optional - Blank means end of day)
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD filter for specific date

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 8; // Items per page

  /* ================= STUDENT HISTORY MODAL STATE ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentHistory, setStudentHistory] = useState<StudentHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"profile" | "outpasses" | "logs" | "complaints">("profile");

  // Fetch specific student history
  const fetchStudentHistory = async (studentId: string | number) => {
    if (!studentId) return;
    setLoadingHistory(true);
    setIsModalOpen(true);
    setActiveModalTab("profile"); // default tab
    try {
      const response: any = await apiFetch(`/api/students/${studentId}/history`);
      // apiFetch returns the raw 'data' directly or throws an error.
      // Wait, let's check how other apiFetch calls handle it.
      // Usually response is either the data array/object, or response.data.
      const data = response?.data || response;
      if (data) {
        setStudentHistory(data);
      } else {
        alert("Failed to load student history: Invalid response format");
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to load student history: " + (err.message || "Unknown error"));
      setIsModalOpen(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchDashboard();
    fetchComplaints();
    fetchEscalatedComplaints();
    fetchHostels();
    fetchLateLogs();
  }, []);

  /* ================= FETCH ESCALATED COMPLAINTS ================= */
  async function fetchEscalatedComplaints() {
    try {
      const response: any = await apiFetch("/complaint/escalated");

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.complaints)
        ? response.complaints
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.complaints)
        ? response.data.complaints
        : [];

      setEscalatedComplaints(list);
    } catch (err) {
      console.error("ESCALATED COMPLAINT FETCH ERROR:", err);
      setEscalatedComplaints([]);
    }
  }

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

  /* ================= FETCH LATE LOGS ================= */

  async function fetchLateLogs() {
    try {
      const response: any = await apiFetch("/api/outpasses/late-returns");

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.late_returns)
        ? response.late_returns
        : [];

      setLateLogs(list);
    } catch (err) {
      console.error("LATE LOGS FETCH ERROR:", err);
      setLateLogs([]);
    }
  }

  /* ================= LOGOUT ================= */

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  /* ================= HELPER FOR FORMATTING TIME ================= */
  function format12Hour(time24: string) {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${period}`;
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

      const matchesCampus =
        campusFilter === "All" ||
        (campusFilter === "Outside" && pass.std_status === "Out") ||
        (campusFilter === "Inside" && pass.std_status !== "Out");

      const matchesDate =
        !selectedDate ||
        (pass.created_at && pass.created_at.startsWith(selectedDate)) ||
        (pass.departure_datetime && pass.departure_datetime.startsWith(selectedDate)) ||
        (pass.arrival_datetime && pass.arrival_datetime.startsWith(selectedDate));

      return matchesSearch && matchesStatus && matchesHostel && matchesCampus && matchesDate;
    });
  }, [outpasses, search, statusFilter, hostelFilter, campusFilter, selectedDate]);

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

      const matchesDate =
        !selectedDate ||
        (comp.date_created && comp.date_created.startsWith(selectedDate));

      return matchesSearch && matchesHostel && matchesDate;
    });
  }, [complaints, search, hostelFilter, selectedDate]);

  /* ================= FILTER & PAGINATE ESCALATED COMPLAINTS ================= */

  const filteredEscalated = useMemo(() => {
    const safeComplaints = Array.isArray(escalatedComplaints) ? escalatedComplaints : [];

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

      const matchesDate =
        !selectedDate ||
        (comp.date_created && comp.date_created.startsWith(selectedDate));

      return matchesSearch && matchesHostel && matchesDate;
    });
  }, [escalatedComplaints, search, hostelFilter, selectedDate]);

  /* ================= FILTER & PAGINATE LATE LOGS (TIME RANGE) ================= */

  const filteredLateLogs = useMemo(() => {
    const safeLateLogs = Array.isArray(lateLogs) ? lateLogs : [];
    
    // Parse From Time
    const [fromH, fromM] = fromTime.split(":").map(Number);
    const startMinutes = (fromH || 0) * 60 + (fromM || 0);

    // Parse To Time (Default to End of Day 23:59 if blank)
    const [toH, toM] = toTime ? toTime.split(":").map(Number) : [23, 59];
    const endMinutes = (toH ?? 23) * 60 + (toM ?? 59);

    const lateFromOutpasses: LateLog[] = (Array.isArray(outpasses) ? outpasses : [])
      .filter((pass: Outpass) => {
        if (!pass.arrival_datetime) return false;
        const arrivalDate = new Date(pass.arrival_datetime);
        const totalMinutes = arrivalDate.getHours() * 60 + arrivalDate.getMinutes();
        
        // Return time must fall between fromTime and toTime
        const fallsInWindow = totalMinutes >= startMinutes && totalMinutes <= endMinutes;
        return fallsInWindow || pass.std_status === "Out";
      })
      .map((pass: Outpass) => ({
        id: pass.id,
        name: pass.name,
        roll_no: pass.roll_no,
        department: pass.department,
        hostel: pass.hostel,
        place_of_visit: pass.place_of_visit,
        departure_datetime: pass.departure_datetime,
        arrival_datetime: pass.arrival_datetime,
        std_status: pass.std_status,
        created_at: pass.created_at,
        outpass_type: pass.outpass_type,
        student_id: pass.student_id,
      }));

    const mergedMap = new Map<string, LateLog>();
    safeLateLogs.forEach((item) => mergedMap.set(item.id, item));
    lateFromOutpasses.forEach((item) => {
      if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
    });

    const combinedList = Array.from(mergedMap.values());

    return combinedList.filter((log: LateLog) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        log.name?.toLowerCase().includes(q) ||
        log.roll_no?.toLowerCase().includes(q) ||
        log.department?.toLowerCase().includes(q);

      const matchesHostel =
        hostelFilter === "All" || log.hostel === hostelFilter;

      const matchesCampus =
        campusFilter === "All" ||
        (campusFilter === "Outside" && log.std_status === "Out") ||
        (campusFilter === "Inside" && log.std_status !== "Out");

      const matchesDate =
        !selectedDate ||
        (log.arrival_datetime && log.arrival_datetime.startsWith(selectedDate)) ||
        (log.departure_datetime && log.departure_datetime.startsWith(selectedDate)) ||
        (log.created_at && log.created_at.startsWith(selectedDate));

      return matchesSearch && matchesHostel && matchesCampus && matchesDate;
    });
  }, [lateLogs, outpasses, search, hostelFilter, campusFilter, fromTime, toTime, selectedDate]);

  /* ================= DOWNLOAD PDF REPORT ================= */

  const downloadPDFReport = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.setTextColor(109, 15, 22);
    doc.text("Late Returns & Movement Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateText = selectedDate || "All Dates";
    const rangeText = `${format12Hour(fromTime)} to ${toTime ? format12Hour(toTime) : "End of Day"}`;
    doc.text(`Date: ${dateText} | Time Range: ${rangeText} | Hostel: ${hostelFilter}`, 14, 22);

    const tableHeaders = [
      [
        "Roll No",
        "Student Name",
        "Department",
        "Hostel",
        "Destination",
        "Departure",
        "Expected Arrival",
        "Campus Status",
      ],
    ];

    const tableRows = filteredLateLogs.map((item) => [
      item.roll_no || "-",
      item.name || "-",
      item.department || "-",
      item.hostel || "-",
      item.place_of_visit || "-",
      item.departure_datetime
        ? new Date(item.departure_datetime).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "-",
      item.arrival_datetime
        ? new Date(item.arrival_datetime).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "-",
      item.std_status === "Out" ? "Outside Campus" : "Inside Campus",
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 28,
      theme: "striped",
      headStyles: { fillColor: [109, 15, 22], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const fileDate = selectedDate || "All_Dates";
    doc.save(`Late_Returns_Report_${fileDate}.pdf`);
  };

  // Dynamic Pagination calculations based on Active Tab
  const activeListLength =
    activeTab === "outpasses"
      ? filteredOutpasses.length
      : activeTab === "complaints"
      ? filteredComplaints.length
      : activeTab === "escalated"
      ? filteredEscalated.length
      : filteredLateLogs.length;

  const totalPages = Math.ceil(activeListLength / limit) || 1;

  const paginatedOutpasses = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOutpasses.slice(start, start + limit);
  }, [filteredOutpasses, page, limit]);

  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredComplaints.slice(start, start + limit);
  }, [filteredComplaints, page, limit]);

  const paginatedEscalated = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredEscalated.slice(start, start + limit);
  }, [filteredEscalated, page, limit]);

  const paginatedLateLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLateLogs.slice(start, start + limit);
  }, [filteredLateLogs, page, limit]);

  const handleTabSwitch = (tab: "outpasses" | "complaints" | "escalated" | "lateLogs") => {
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

        <div className="flex items-center gap-3">
          {/* DIRECT PDF DOWNLOAD BUTTON */}
          {activeTab === "lateLogs" && (
            <button
              onClick={downloadPDFReport}
              disabled={filteredLateLogs.length === 0}
              className="bg-white text-[#6d0f16] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              📥 Download PDF Report
            </button>
          )}

          <button
            onClick={logout}
            className="bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] px-4 py-2 rounded-xl text-xs font-semibold transition border border-white/20 shadow-xs cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* ================= FILTERS & TIME RANGE ================= */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="All">All Outpass Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}

            {activeTab !== "complaints" && activeTab !== "escalated" && (
              <select
                value={campusFilter}
                onChange={(e) =>
                  handleFilterChange(setCampusFilter, e.target.value)
                }
                className="bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
              >
                <option value="All">All Locations (Inside & Outside)</option>
                <option value="Outside">Outside Campus</option>
                <option value="Inside">Inside Campus</option>
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

          {/* DYNAMIC TIME RANGE (FROM -> TO) & DATE PICKER */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* DATE PICKER */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  📅 Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    handleFilterChange(setSelectedDate, e.target.value)
                  }
                  className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none focus:border-[#6d0f16] transition"
                />
                {selectedDate && (
                  <button
                    onClick={() => handleFilterChange(setSelectedDate, "")}
                    className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                  >
                    Clear Date
                  </button>
                )}
              </div>

              {/* TIME RANGE: FROM & TO */}
              {activeTab === "lateLogs" && (
                <div className="flex items-center gap-3 bg-gray-50/80 p-2 border border-gray-200 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      ⏰ From:
                    </label>
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) =>
                        handleFilterChange(setFromTime, e.target.value)
                      }
                      className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#6d0f16] transition"
                    />
                  </div>

                  <span className="text-gray-400 font-bold text-xs">→</span>

                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      To:
                    </label>
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) =>
                        handleFilterChange(setToTime, e.target.value)
                      }
                      placeholder="End of Day"
                      className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#6d0f16] transition"
                    />
                  </div>

                  <span className="text-xs font-bold text-[#6d0f16] px-1">
                    ({format12Hour(fromTime)} - {toTime ? format12Hour(toTime) : "End of Day"})
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Showing logs for: <span className="font-bold text-gray-700">{selectedDate || "All Dates"}</span>
            </p>
          </div>
        </div>

        {/* ================= TABS ================= */}

        <div className="flex gap-3 flex-wrap">
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

          <button
            onClick={() => handleTabSwitch("escalated")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
              activeTab === "escalated"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Problems Not Resolved
          </button>

          <button
            onClick={() => handleTabSwitch("lateLogs")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lateLogs"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span></span> Late Logs ({format12Hour(fromTime)} - {toTime ? format12Hour(toTime) : "End"}) ({filteredLateLogs.length})
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
                              <h3 
                                className="font-bold text-[#6d0f16] cursor-pointer hover:underline"
                                onClick={() => fetchStudentHistory(pass.student_id || '')}
                              >
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
                            <h3 
                              className="font-bold text-[#6d0f16] cursor-pointer hover:underline"
                              onClick={() => fetchStudentHistory(comp.student_id || '')}
                            >
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

        {/* ================= ESCALATED COMPLAINTS TABLE ================= */}

        {activeTab === "escalated" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#6d0f16]">
                Problems Not Resolved
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                {filteredEscalated.length} High Priority
              </span>
            </div>

            {filteredEscalated.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No unresolved problems. All good!
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
                      <th className="px-6 py-3.5">Date Raised</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedEscalated.map((comp: Complaint) => {
                      const daysOld = Math.floor((new Date().getTime() - new Date(comp.date_created).getTime()) / (1000 * 3600 * 24));
                      
                      return (
                      <tr
                        key={comp.id}
                        className="hover:bg-gray-50/80 transition bg-white"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <h3 
                              className="font-bold text-[#6d0f16] cursor-pointer hover:underline"
                              onClick={() => fetchStudentHistory(comp.student_id || '')}
                            >
                              {comp.student_name || "-"}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {comp.student_roll_no || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-bold text-gray-700">
                          {comp.hostel || "-"}
                        </td>

                        <td className="px-6 py-4 max-w-md">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {comp.title || "Complaint"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {comp.description}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className="text-[11px] px-3 py-1 rounded-full font-bold border bg-red-100 text-red-800 border-red-200"
                          >
                            Unresolved
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {comp.date_created
                                ? new Date(comp.date_created).toLocaleDateString(
                                    "en-IN", { month: "short", day: "numeric", year: "numeric" }
                                  )
                                : "-"}
                            </span>
                            <span className="text-[10px] text-red-600 font-bold uppercase mt-1">
                              {daysOld} Days Overdue
                            </span>
                          </div>
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

        {/* ================= LATE LOGS TABLE ================= */}

        {activeTab === "lateLogs" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/80 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#6d0f16]">
                  Late Campus Entries & Movement Logs
                </h2>
                <p className="text-xs text-gray-500">
                  Time Window: {format12Hour(fromTime)} to {toTime ? format12Hour(toTime) : "End of Day"}
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {filteredLateLogs.length} Records Found
              </span>
            </div>

            {filteredLateLogs.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No late entries or overdue returns found for this time range
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Hostel</th>
                      <th className="px-6 py-3.5">Destination</th>
                      <th className="px-6 py-3.5">Departure</th>
                      <th className="px-6 py-3.5">Expected Return</th>
                      <th className="px-6 py-3.5">Campus Status</th>
                      <th className="px-6 py-3.5">Time Flag</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedLateLogs.map((log: LateLog) => (
                      <tr
                        key={log.id}
                        className="hover:bg-red-50/30 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <h3 
                              className="font-bold text-[#6d0f16] cursor-pointer hover:underline"
                              onClick={() => fetchStudentHistory(log.student_id || '')}
                            >
                              {log.name || "-"}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {log.roll_no || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                          {log.hostel || "-"}
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                          {log.place_of_visit || "-"}
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                          {log.departure_datetime
                            ? new Date(log.departure_datetime).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                          {log.arrival_datetime
                            ? new Date(log.arrival_datetime).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-[11px] px-3 py-1 rounded-full font-semibold border ${
                              log.std_status === "Out"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }`}
                          >
                            {log.std_status === "Out" ? "Outside Campus" : "Inside Campus"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="bg-red-100 text-red-800 border border-red-200/60 text-[11px] px-3 py-1 rounded-full font-bold">
                            ⚠️ {format12Hour(fromTime)} - {toTime ? format12Hour(toTime) : "End"}
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

      {/* ================= COMPREHENSIVE STUDENT HISTORY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50/80">
              <div>
                <h2 className="text-2xl font-bold text-[#6d0f16] flex items-center gap-2">
                  Student 360° History
                </h2>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">
                  Complete view of outpasses, gate logs, and complaints
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* MODAL BODY */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {loadingHistory ? (
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#6d0f16] rounded-full animate-spin"></div>
                  <p className="font-bold text-gray-500 uppercase text-xs tracking-wider">Fetching data across tables...</p>
                </div>
              ) : studentHistory ? (
                <>
                  {/* MODAL TABS */}
                  <div className="bg-white border-b border-gray-200 px-6 pt-4 flex gap-6 overflow-x-auto">
                    <button
                      onClick={() => setActiveModalTab("profile")}
                      className={`pb-4 font-bold text-sm tracking-wide transition-colors ${activeModalTab === 'profile' ? 'text-[#6d0f16] border-b-2 border-[#6d0f16]' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      Profile & Academic
                    </button>
                    <button
                      onClick={() => setActiveModalTab("outpasses")}
                      className={`pb-4 font-bold text-sm tracking-wide transition-colors ${activeModalTab === 'outpasses' ? 'text-[#6d0f16] border-b-2 border-[#6d0f16]' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      Outpass Requests ({studentHistory.outpasses?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveModalTab("logs")}
                      className={`pb-4 font-bold text-sm tracking-wide transition-colors ${activeModalTab === 'logs' ? 'text-[#6d0f16] border-b-2 border-[#6d0f16]' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      Physical Gate Logs ({studentHistory.visit_logs?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveModalTab("complaints")}
                      className={`pb-4 font-bold text-sm tracking-wide transition-colors ${activeModalTab === 'complaints' ? 'text-[#6d0f16] border-b-2 border-[#6d0f16]' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      Complaints ({studentHistory.complaints?.length || 0})
                    </button>
                  </div>

                  {/* MODAL CONTENT AREA */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    
                    {/* TAB: PROFILE */}
                    {activeModalTab === "profile" && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 pb-2 border-b border-gray-100">Primary Information</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                            <div>
                              <span className="block text-[10px] text-gray-400 font-bold uppercase">Full Name</span>
                              <span className="font-semibold text-lg text-gray-900">{studentHistory.profile.name}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-400 font-bold uppercase">Roll Number</span>
                              <span className="font-semibold text-lg text-[#6d0f16]">{studentHistory.profile.roll_no}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-400 font-bold uppercase">Phone Number</span>
                              <span className="font-semibold text-sm text-gray-800">{studentHistory.profile.phone || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-400 font-bold uppercase">Email Address</span>
                              <span className="font-semibold text-sm text-gray-800 break-all">{studentHistory.profile.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 pb-2 border-b border-gray-100">Housing details</h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Hostel</span>
                                <span className="font-bold text-gray-900">{studentHistory.profile.hostel}</span>
                              </div>
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Room Number</span>
                                <span className="font-bold text-gray-900">{studentHistory.profile.room || 'Not Assigned'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 pb-2 border-b border-gray-100">Academic details</h3>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Department</span>
                                <span className="font-bold text-gray-900">{studentHistory.profile.department || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Degree Type</span>
                                <span className="font-bold text-gray-900">{studentHistory.profile.degree_type || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: OUTPASSES */}
                    {activeModalTab === "outpasses" && (
                      <div className="animate-fadeIn space-y-4">
                        {studentHistory.outpasses?.length > 0 ? (
                          studentHistory.outpasses.map((op: any) => (
                            <div key={op.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {op.outpass_type}
                                  </span>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                    op.outp_status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                    op.outp_status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {op.outp_status}
                                  </span>
                                  {op.is_emergency && <span className="text-[10px] font-bold uppercase px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200">Emergency</span>}
                                </div>
                                <h4 className="font-bold text-gray-900 mt-2 mb-1">
                                  Dest: <span className="font-normal text-gray-700">{op.destination || op.place_of_visit}</span>
                                </h4>
                                <p className="text-sm text-gray-500 italic">"{op.purpose || op.reason}"</p>
                              </div>
                              <div className="md:w-64 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="font-bold text-gray-400 uppercase tracking-wider">Applied</span>
                                  <span className="font-medium text-gray-800">{new Date(op.created_at || op.date_created).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-bold text-gray-400 uppercase tracking-wider">From</span>
                                  <span className="font-medium text-gray-800">{new Date(op.departure_datetime || op.date_from).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-bold text-gray-400 uppercase tracking-wider">To</span>
                                  <span className="font-medium text-gray-800">{new Date(op.arrival_datetime || op.date_to).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <span className="text-4xl block mb-3">🎫</span>
                            <span className="font-medium">No outpasses generated by this student.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: LOGS */}
                    {activeModalTab === "logs" && (
                      <div className="animate-fadeIn space-y-4">
                        {studentHistory.visit_logs?.length > 0 ? (
                          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                                <tr>
                                  <th className="px-6 py-4">Action</th>
                                  <th className="px-6 py-4">Destination</th>
                                  <th className="px-6 py-4">Gate</th>
                                  <th className="px-6 py-4">Exit Time</th>
                                  <th className="px-6 py-4">Entry Time</th>
                                  <th className="px-6 py-4">Remarks</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {studentHistory.visit_logs.map((log: any) => (
                                  <tr key={log.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold text-[10px] uppercase">{log.outpass_type}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{log.destination || log.place_of_visit || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{log.gate || '-'}</td>
                                    <td className="px-6 py-4 text-orange-600 font-semibold">
                                      {log.actual_departure ? new Date(log.actual_departure).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-emerald-600 font-semibold">
                                      {log.actual_arrival ? new Date(log.actual_arrival).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 italic text-xs">{log.remarks || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <span className="text-4xl block mb-3">🚪</span>
                            <span className="font-medium">No physical gate movements found.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: COMPLAINTS */}
                    {activeModalTab === "complaints" && (
                      <div className="animate-fadeIn space-y-4">
                        {studentHistory.complaints?.length > 0 ? (
                          studentHistory.complaints.map((comp: any) => (
                            <div key={comp.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                    comp.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {comp.status}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium">{new Date(comp.date_created).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-base">{comp.title}</h4>
                                <p className="text-sm text-gray-600 mt-2">{comp.description}</p>
                              </div>
                              {comp.resolved_description && (
                                <div className="md:w-1/3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                  <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Resolution</span>
                                  <p className="text-xs text-gray-700">{comp.resolved_description}</p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <span className="text-4xl block mb-3">🗣️</span>
                            <span className="font-medium">No complaints raised by this student.</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warden;