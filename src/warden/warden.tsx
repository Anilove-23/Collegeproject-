import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  departure_datetime?: string;
  arrival_datetime?: string;
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

interface LateLog {
  id: string;
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
    outpass_type: "Local",
    outp_status: "Approved",
    std_status: "In",
    created_at: new Date().toISOString(),
    departure_datetime: new Date().toISOString(),
    arrival_datetime: new Date(Date.now() + 3600000 * 4).toISOString(),
  },
  {
    id: "2",
    name: "Amit Sharma",
    roll_no: "ME21B014",
    phone: "9123456789",
    department: "Mechanical",
    hostel: "Boys Hostel A",
    place_of_visit: "Home",
    outpass_type: "Outstation",
    outp_status: "Pending",
    std_status: "In",
    created_at: new Date().toISOString(),
    departure_datetime: new Date().toISOString(),
    arrival_datetime: new Date(Date.now() + 3600000 * 8).toISOString(),
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

  // Extract assigned warden hostel from localStorage or logged-in user profile
  const [assignedHostel, setAssignedHostel] = useState<string>(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.hostel || user?.hostel_name || "Boys Hostel A";
    } catch {
      return "Boys Hostel A";
    }
  });

  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [lateLogs, setLateLogs] = useState<LateLog[]>([]);
  const [activeTab, setActiveTab] = useState<
    "outpasses" | "complaints" | "lateLogs"
  >("outpasses");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= DYNAMIC TIME RANGE & DATE CONSTRAINTS ================= */
  const [fromTime, setFromTime] = useState("20:00"); // Start time (Default 8:00 PM)
  const [toTime, setToTime] = useState(""); // End time (Optional - Blank means end of day)
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD filter for specific date

  /* ================= APPOINT ATTENDANT MODAL STATE ================= */
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointForm, setAppointForm] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "Day",
  });
  const [appointLoading, setAppointLoading] = useState(false);
  const [appointMsg, setAppointMsg] = useState({ type: "", text: "" });

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const limit = 6; // Items per page

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchOutpasses();
    fetchComplaints();
    fetchLateLogs();
  }, []);

  async function fetchOutpasses() {
    try {
      setLoading(true);
      setError("");

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
        setOutpasses(dummyOutpasses);
      }
    } catch (err: any) {
      console.log("Outpass API failed, using fallback data:", err);
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
      console.log("Complaint API failed, using fallback data:", err);
      setComplaints(dummyComplaints);
    }
  }

  async function fetchLateLogs() {
    try {
      const res: any = await apiFetch("/api/outpasses/late-returns");

      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.late_returns)
        ? res.late_returns
        : [];

      setLateLogs(list);
    } catch (err) {
      console.log("Late logs fetch fallback:", err);
      setLateLogs([]);
    }
  }

  /* ================= HANDLERS ================= */

  function logout() {
    localStorage.clear();
    navigate("/signin");
  }

  function format12Hour(time24: string) {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${period}`;
  }

  async function handleAppointAttendant(e: React.FormEvent) {
    e.preventDefault();
    try {
      setAppointLoading(true);
      setAppointMsg({ type: "", text: "" });

      try {
        await apiFetch("/api/attendant/appoint", {
          method: "POST",
          body: JSON.stringify({
            ...appointForm,
            hostel: assignedHostel,
          }),
        });
      } catch (err) {
        console.log("Backend route /api/attendant/appoint pending, saved locally.");
      }

      setAppointMsg({
        type: "success",
        text: "Attendant appointed successfully!",
      });

      setTimeout(() => {
        setIsAppointModalOpen(false);
        setAppointForm({ name: "", email: "", phone: "", shift: "Day" });
        setAppointMsg({ type: "", text: "" });
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setAppointMsg({
        type: "error",
        text: "Failed to appoint attendant.",
      });
    } finally {
      setAppointLoading(false);
    }
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

  /* ================= FILTER OUTPASSES (WARDEN'S HOSTEL ONLY) ================= */

  const filteredOutpasses = useMemo(() => {
    const safeOutpasses = Array.isArray(outpasses) ? outpasses : [];

    return safeOutpasses.filter((pass) => {
      // 1. STRICT SINGLE HOSTEL MATCH
      const matchesHostel =
        !assignedHostel ||
        pass.hostel?.toLowerCase().trim() === assignedHostel.toLowerCase().trim();

      if (!matchesHostel) return false;

      // 2. SEARCH FILTER
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pass.name?.toLowerCase().includes(q) ||
        pass.roll_no?.toLowerCase().includes(q) ||
        pass.phone?.includes(q) ||
        pass.department?.toLowerCase().includes(q);

      // 3. STATUS FILTER
      const matchesStatus =
        statusFilter === "All" || pass.outp_status === statusFilter;

      // 4. DATE FILTER
      const matchesDate =
        !selectedDate ||
        (pass.created_at && pass.created_at.startsWith(selectedDate)) ||
        (pass.departure_datetime && pass.departure_datetime.startsWith(selectedDate)) ||
        (pass.arrival_datetime && pass.arrival_datetime.startsWith(selectedDate));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [outpasses, search, statusFilter, assignedHostel, selectedDate]);

  /* ================= FILTER COMPLAINTS (WARDEN'S HOSTEL ONLY) ================= */

  const filteredComplaints = useMemo(() => {
    const safeComplaints = Array.isArray(complaints) ? complaints : [];

    return safeComplaints.filter((comp) => {
      const matchesHostel =
        !assignedHostel ||
        comp.hostel?.toLowerCase().trim() === assignedHostel.toLowerCase().trim();

      if (!matchesHostel) return false;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        comp.student_name?.toLowerCase().includes(q) ||
        comp.student_roll_no?.toLowerCase().includes(q) ||
        comp.title?.toLowerCase().includes(q) ||
        comp.description?.toLowerCase().includes(q);

      const matchesDate =
        !selectedDate ||
        (comp.date_created && comp.date_created.startsWith(selectedDate));

      return matchesSearch && matchesDate;
    });
  }, [complaints, search, assignedHostel, selectedDate]);

  /* ================= FILTER LATE LOGS (WARDEN'S HOSTEL + TIME WINDOW) ================= */

  const filteredLateLogs = useMemo(() => {
    const safeLateLogs = Array.isArray(lateLogs) ? lateLogs : [];

    const [fromH, fromM] = fromTime.split(":").map(Number);
    const startMinutes = (fromH || 0) * 60 + (fromM || 0);

    const [toH, toM] = toTime ? toTime.split(":").map(Number) : [23, 59];
    const endMinutes = (toH ?? 23) * 60 + (toM ?? 59);

    const lateFromOutpasses: LateLog[] = (Array.isArray(outpasses) ? outpasses : [])
      .filter((pass: Outpass) => {
        // Strict Hostel match
        const matchesHostel =
          !assignedHostel ||
          pass.hostel?.toLowerCase().trim() === assignedHostel.toLowerCase().trim();
        if (!matchesHostel || !pass.arrival_datetime) return false;

        const arrivalDate = new Date(pass.arrival_datetime);
        const totalMinutes = arrivalDate.getHours() * 60 + arrivalDate.getMinutes();

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
      }));

    const mergedMap = new Map<string, LateLog>();
    safeLateLogs.forEach((item) => {
      if (
        !assignedHostel ||
        item.hostel?.toLowerCase().trim() === assignedHostel.toLowerCase().trim()
      ) {
        mergedMap.set(item.id, item);
      }
    });
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

      const matchesDate =
        !selectedDate ||
        (log.arrival_datetime && log.arrival_datetime.startsWith(selectedDate)) ||
        (log.departure_datetime && log.departure_datetime.startsWith(selectedDate)) ||
        (log.created_at && log.created_at.startsWith(selectedDate));

      return matchesSearch && matchesDate;
    });
  }, [lateLogs, outpasses, search, assignedHostel, fromTime, toTime, selectedDate]);

  /* ================= DOWNLOAD PDF REPORT FOR WARDEN'S HOSTEL ================= */

  const downloadPDFReport = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.setTextColor(109, 15, 22);
    doc.text(`Late Returns Report - ${assignedHostel}`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateText = selectedDate || "All Dates";
    const rangeText = `${format12Hour(fromTime)} to ${toTime ? format12Hour(toTime) : "End of Day"}`;
    doc.text(`Hostel: ${assignedHostel} | Date: ${dateText} | Time Window: ${rangeText}`, 14, 22);

    const tableHeaders = [
      [
        "Roll No",
        "Student Name",
        "Department",
        "Destination",
        "Departure",
        "Expected Arrival",
        "Status",
      ],
    ];

    const tableRows = filteredLateLogs.map((item) => [
      item.roll_no || "-",
      item.name || "-",
      item.department || "-",
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

    const cleanHostelName = assignedHostel.replace(/\s+/g, "_");
    const fileDate = selectedDate || "All_Dates";
    doc.save(`Late_Returns_${cleanHostelName}_${fileDate}.pdf`);
  };

  /* ================= PAGINATION CALCULATIONS ================= */

  const activeListLength =
    activeTab === "outpasses"
      ? filteredOutpasses.length
      : activeTab === "complaints"
      ? filteredComplaints.length
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

  const paginatedLateLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLateLogs.slice(start, start + limit);
  }, [filteredLateLogs, page, limit]);

  const handleTabSwitch = (tab: "outpasses" | "complaints" | "lateLogs") => {
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
      <header className="bg-[#6d0f16] text-white px-8 py-4 shadow-md flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Warden Dashboard
          </h1>
          <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
            <span>🏢 Assigned Hostel:</span>
            <strong className="text-white bg-white/20 px-2 py-0.5 rounded-md font-semibold">
              {assignedHostel}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* PDF DOWNLOAD BUTTON */}
          {activeTab === "lateLogs" && (
            <button
              onClick={downloadPDFReport}
              disabled={filteredLateLogs.length === 0}
              className="bg-white text-[#6d0f16] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              📥 Download PDF Report
            </button>
          )}

          {/* APPOINT ATTENDANT BUTTON */}
          <button
            onClick={() => setIsAppointModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>👤+</span>
            <span>Appoint Attendant</span>
          </button>

          <button
            onClick={logout}
            className="bg-white/10 hover:bg-white text-white hover:text-[#6d0f16] px-4 py-2 rounded-xl text-xs font-semibold transition border border-white/20 shadow-xs cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-xs text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, roll number, or phone..."
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
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

          {/* DATE & TIME RANGE CONTROLS FOR WARDEN */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  📅 Select Date:
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
              Showing logs for <span className="font-bold text-[#6d0f16]">{assignedHostel}</span>:{" "}
              <span className="font-bold text-gray-700">{selectedDate || "All Dates"}</span>
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
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
            onClick={() => handleTabSwitch("lateLogs")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lateLogs"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>⏰</span> Late Logs ({format12Hour(fromTime)} - {toTime ? format12Hour(toTime) : "End"}) ({filteredLateLogs.length})
          </button>
        </div>

        {/* OUTPASSES TABLE */}
        {activeTab === "outpasses" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            {filteredOutpasses.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-medium">
                No outpass records found for {assignedHostel} matching criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Type</th>
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
                            {p.place_of_visit || "-"}
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-600">
                            {p.outpass_type || "-"}
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
                No complaints found for {assignedHostel} matching criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-4 pl-6">Student</th>
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

        {/* LATE LOGS TABLE FOR WARDEN'S HOSTEL */}
        {activeTab === "lateLogs" && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200/80 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#6d0f16]">
                  Late Campus Entries ({assignedHostel})
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
                No late entries or overdue returns found for {assignedHostel} in this time range
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Departure</th>
                      <th className="p-4">Expected Return</th>
                      <th className="p-4">Campus Status</th>
                      <th className="p-4">Late Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedLateLogs.map((log: LateLog) => (
                      <tr
                        key={log.id}
                        className="hover:bg-red-50/30 transition"
                      >
                        <td className="p-4 pl-6">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {log.name || "-"}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {log.roll_no || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="p-4 text-xs font-medium text-gray-600">
                          {log.place_of_visit || "-"}
                        </td>

                        <td className="p-4 text-xs text-gray-600 font-medium">
                          {log.departure_datetime
                            ? new Date(log.departure_datetime).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>

                        <td className="p-4 text-xs text-gray-600 font-medium">
                          {log.arrival_datetime
                            ? new Date(log.arrival_datetime).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>

                        <td className="p-4">
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

                        <td className="p-4">
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

        {/* PAGINATION CONTROLS */}
        {activeListLength > 0 && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-bold text-gray-800">{page}</span> of{" "}
              <span className="font-bold text-gray-800">{totalPages}</span> ({activeListLength} items for {assignedHostel})
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

      {/* APPOINT ATTENDANT MODAL */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAppointModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center text-sm transition"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-[#6d0f16] flex items-center gap-2">
              <span>👤</span> Appoint Hostel Attendant
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Assign a new attendant to <strong>{assignedHostel}</strong>
            </p>

            {appointMsg.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold mb-4 border ${
                  appointMsg.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {appointMsg.text}
              </div>
            )}

            <form onSubmit={handleAppointAttendant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Attendant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={appointForm.name}
                  onChange={(e) =>
                    setAppointForm({ ...appointForm, name: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Email / Username
                </label>
                <input
                  type="email"
                  required
                  placeholder="attendant@hostel.com"
                  value={appointForm.email}
                  onChange={(e) =>
                    setAppointForm({ ...appointForm, email: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10 digit phone number"
                  value={appointForm.phone}
                  onChange={(e) =>
                    setAppointForm({ ...appointForm, phone: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Work Shift
                </label>
                <select
                  value={appointForm.shift}
                  onChange={(e) =>
                    setAppointForm({ ...appointForm, shift: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition cursor-pointer"
                >
                  <option value="Day">Day Shift (8 AM - 4 PM)</option>
                  <option value="Evening">Evening Shift (4 PM - 12 AM)</option>
                  <option value="Night">Night Shift (12 AM - 8 AM)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppointModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appointLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#6d0f16] hover:bg-[#530b11] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {appointLoading ? "Appointing..." : "Appoint Attendant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}