import React, { useEffect, useState } from "react";
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

/* ================= DUMMY DATA ================= */

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
    description: "No water since morning",
    hostel: "Boys Hostel A",
    status: "Pending",
    student_name: "Rahul Kumar",
    student_roll_no: "CS21A001",
    date_created: new Date().toISOString(),
  },
];

/* ================= COMPONENT ================= */

function Warden() {
  const navigate = useNavigate();

  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] =
    useState<"outpasses" | "complaints">("outpasses");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchOutpasses();
    fetchComplaints();
  }, []);

  async function fetchOutpasses() {
    try {
      setLoading(true);
      setError("");

      const res: any = await apiFetch("/attendant/outpasses");
      setOutpasses(res?.outpasses || res?.data || []);
    } catch (err: any) {
      console.log("API failed, using dummy outpasses");
      setOutpasses(dummyOutpasses);
      setError("API not available. Showing offline data.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchComplaints() {
    try {
      const res: any = await apiFetch("/attendant/complaints");
      setComplaints(res?.complaints || res?.data || []);
    } catch (err) {
      console.log("API failed, using dummy complaints");
      setComplaints(dummyComplaints);
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/signin");
  }

  /* ================= STATUS ================= */

  function getStatus(pass: Outpass) {
    if (pass.std_status === "Out") {
      return {
        label: "Outside",
        className: "bg-orange-100 text-orange-700",
      };
    }

    if (pass.outp_status === "Approved") {
      return {
        label: "Approved",
        className: "bg-green-100 text-green-700",
      };
    }

    if (pass.outp_status === "Pending") {
      return {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Rejected",
      className: "bg-red-100 text-red-700",
    };
  }

  /* ================= FILTER ================= */

  const filteredOutpasses = outpasses.filter((pass) => {
    const matchesSearch =
      pass.name?.toLowerCase().includes(search.toLowerCase()) ||
      pass.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
      pass.phone?.includes(search);

    const matchesStatus =
      statusFilter === "All" || pass.outp_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading Warden Dashboard...</p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <div className="bg-[#6d0f16] text-white px-6 py-4 flex justify-between">
        <h1 className="text-2xl font-bold">Warden Dashboard</h1>
        <button
          onClick={logout}
          className="bg-white text-[#6d0f16] px-4 py-2 rounded-xl font-semibold"
        >
          Logout
        </button>
      </div>

      <div className="p-6">
        {/* SEARCH + STATUS */}
        <div className="bg-white p-5 rounded-2xl mb-6 grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by name / roll / phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-3 rounded-xl"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-4 py-3 rounded-xl"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("outpasses")}
            className={`px-5 py-2 rounded-xl ${
              activeTab === "outpasses"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border"
            }`}
          >
            Outpasses
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className={`px-5 py-2 rounded-xl ${
              activeTab === "complaints"
                ? "bg-[#6d0f16] text-white"
                : "bg-white border"
            }`}
          >
            Complaints
          </button>
        </div>

        {/* OUTPASSES */}
        {activeTab === "outpasses" && (
          <div className="bg-white rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Student</th>
                  <th className="p-4">Dept</th>
                  <th className="p-4">Hostel</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutpasses.map((p) => {
                  const status = getStatus(p);
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-4">
                        <b>{p.name}</b>
                        <div className="text-sm">{p.roll_no}</div>
                      </td>
                      <td className="p-4">{p.department}</td>
                      <td className="p-4">{p.hostel}</td>
                      <td className="p-4">{p.place_of_visit}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
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

        {/* COMPLAINTS */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Student</th>
                  <th className="p-4">Hostel</th>
                  <th className="p-4">Complaint</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4">{c.student_name}</td>
                    <td className="p-4">{c.hostel}</td>
                    <td className="p-4">{c.title}</td>
                    <td className="p-4">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Warden;