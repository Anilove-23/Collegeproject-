import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  apiFetch,
} from "../utils/api";

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

  const navigate =
    useNavigate();

  /* ================= STATES ================= */

  const [outpasses, setOutpasses] =
    useState<Outpass[]>([]);

  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [activeTab, setActiveTab] =
    useState<
      "outpasses" |
      "complaints"
    >("outpasses");

  const [hostels, setHostels] =
    useState<Hostel[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [hostelFilter, setHostelFilter] =
    useState("All");

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

      const response: any =
        await apiFetch(
          "/api/outpasses/monitor"
        );

      setOutpasses(
        response?.data || []
      );

    } catch (err: any) {

      console.log(err);

      setError(
        err?.message ||
        "Failed to load dashboard"
      );

    } finally {

      setLoading(false);
    }
  }

  /* ================= FETCH COMPLAINTS ================= */

  async function fetchComplaints() {

    try {

      const response: any =
        await apiFetch(
          "/complaint/all"
        );

      setComplaints(
        response?.complaints ||
        response?.data ||
        []
      );

    } catch (err) {

      console.log(
        "COMPLAINT FETCH ERROR:",
        err
      );
    }
  }

  /* ================= FETCH HOSTELS ================= */

  async function fetchHostels() {

    try {

      const response: any =
        await apiFetch(
          "/api/hostels"
        );

      if (
        Array.isArray(
          response?.data
        )
      ) {

        setHostels(
          response.data
        );

        return;
      }

      if (
        Array.isArray(
          response
        )
      ) {

        setHostels(
          response
        );

        return;
      }

      if (
        Array.isArray(
          response?.hostels
        )
      ) {

        setHostels(
          response.hostels
        );

        return;
      }

      setHostels([]);

    } catch (err) {

      console.log(
        "HOSTEL FETCH ERROR:",
        err
      );

      setHostels([]);
    }
  }

  /* ================= LOGOUT ================= */

  function logout() {

    localStorage.clear();

    navigate("/");
  }

  /* ================= STATUS ================= */

  function getStatus(
    pass: Outpass
  ) {

    if (
      pass.std_status ===
      "Out"
    ) {

      return {
        label:
          "Outside Campus",

        className:
          "bg-orange-100 text-orange-700",
      };
    }

    if (
      pass.outp_status ===
      "Approved"
    ) {

      return {
        label:
          "Approved",

        className:
          "bg-green-100 text-green-700",
      };
    }

    if (
      pass.outp_status ===
      "Pending"
    ) {

      return {
        label:
          "Pending",

        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label:
        "Rejected",

      className:
        "bg-red-100 text-red-700",
    };
  }

  /* ================= FILTER ================= */

  const filtered =
    outpasses.filter(
      (pass: Outpass) => {

        const matchesSearch =

          pass.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          pass.roll_no
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          pass.phone
            ?.includes(search);

        const matchesStatus =

          statusFilter ===
            "All" ||

          pass.outp_status ===
            statusFilter;

        const matchesHostel =

          hostelFilter ===
            "All" ||

          pass.hostel ===
            hostelFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesHostel
        );
      }
    );

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="text-center">

          <div className="w-14 h-14 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-gray-600 font-medium">

            Loading Dashboard...

          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100">

      {/* ================= NAVBAR ================= */}

      <div className="bg-[#6d0f16] text-white px-6 py-4 shadow-lg flex justify-between items-center">

        <div className="flex items-center gap-4">

          <img
            src="/l.png"
            alt="logo"
            className="w-12 h-12 object-contain"
          />

          <div>

            <h1 className="text-2xl font-bold">

              Chief Warden Dashboard

            </h1>

            <p className="text-sm text-white/70">

              Hostel Monitoring System

            </p>

          </div>

        </div>

        <button
          onClick={logout}
          className="bg-white text-[#6d0f16] px-5 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
        >

          Logout

        </button>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="p-6">

        {/* ================= FILTERS ================= */}

        <div className="bg-white rounded-3xl shadow-sm border p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Search by name, roll no or phone..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6d0f16]"
            />

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6d0f16]"
            >

              <option value="All">

                All Status

              </option>

              <option value="Pending">

                Pending

              </option>

              <option value="Approved">

                Approved

              </option>

              <option value="Rejected">

                Rejected

              </option>

            </select>

            <select
              value={
                hostelFilter
              }
              onChange={(e) =>
                setHostelFilter(
                  e.target.value
                )
              }
              className="border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#6d0f16]"
            >

              <option value="All">

                All Hostels

              </option>

              {hostels.map(
                (hostel) => {

                  const hostelName =

                    hostel.name ||

                    hostel.hostel_name ||

                    "Unknown";

                  return (

                    <option
                      key={
                        hostel.id ||
                        hostelName
                      }
                      value={
                        hostelName
                      }
                    >

                      {hostelName}

                    </option>
                  );
                }
              )}

            </select>

          </div>

        </div>

        {/* ================= TABS ================= */}

        <div className="flex gap-4 mb-6">

          <button
            onClick={() =>
              setActiveTab(
                "outpasses"
              )
            }
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              activeTab ===
              "outpasses"

                ? "bg-[#6d0f16] text-white"

                : "bg-white border"
            }`}
          >

            Outpasses

          </button>

          <button
            onClick={() =>
              setActiveTab(
                "complaints"
              )
            }
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              activeTab ===
              "complaints"

                ? "bg-[#6d0f16] text-white"

                : "bg-white border"
            }`}
          >

            Complaints

          </button>

        </div>

        {/* ================= ERROR ================= */}

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6">

            {error}

          </div>
        )}

        {/* ================= OUTPASS TABLE ================= */}

        {activeTab ===
        "outpasses" && (

          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b flex justify-between items-center">

              <h2 className="text-xl font-bold text-[#6d0f16]">

                Student Outpass Records

              </h2>

              <span className="text-sm text-gray-500">

                {
                  filtered.length
                }
                {" "}
                Records

              </span>

            </div>

            {filtered.length ===
            0 ? (

              <div className="p-16 text-center text-gray-500">

                No records found

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50 border-b">

                    <tr className="text-left text-sm text-gray-500">

                      <th className="px-6 py-4">

                        Student

                      </th>

                      <th className="px-6 py-4">

                        Department

                      </th>

                      <th className="px-6 py-4">

                        Hostel

                      </th>

                      <th className="px-6 py-4">

                        Destination

                      </th>

                      <th className="px-6 py-4">

                        Type

                      </th>

                      <th className="px-6 py-4">

                        Status

                      </th>

                      <th className="px-6 py-4">

                        Date

                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filtered.map(
                      (
                        pass: Outpass
                      ) => {

                        const status =
                          getStatus(
                            pass
                          );

                        return (

                          <tr
                            key={
                              pass.id
                            }
                            className="border-b hover:bg-gray-50 transition"
                          >

                            <td className="px-6 py-5">

                              <div>

                                <h3 className="font-semibold text-gray-800">

                                  {
                                    pass.name
                                  }

                                </h3>

                                <p className="text-sm text-gray-500">

                                  {
                                    pass.roll_no
                                  }

                                </p>

                              </div>

                            </td>

                            <td className="px-6 py-5 text-sm text-gray-700">

                              {
                                pass.department ||
                                "-"
                              }

                            </td>

                            <td className="px-6 py-5 text-sm text-gray-700">

                              {
                                pass.hostel ||
                                "-"
                              }

                            </td>

                            <td className="px-6 py-5 text-sm text-gray-700">

                              {
                                pass.place_of_visit ||
                                "-"
                              }

                            </td>

                            <td className="px-6 py-5">

                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">

                                {
                                  pass.outpass_type
                                }

                              </span>

                            </td>

                            <td className="px-6 py-5">

                              <span
                                className={`text-xs px-3 py-1 rounded-full font-semibold ${status.className}`}
                              >

                                {
                                  status.label
                                }

                              </span>

                            </td>

                            <td className="px-6 py-5 text-sm text-gray-600">

                              {pass.created_at
                                ? new Date(
                                    pass.created_at
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "-"}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

        {/* ================= COMPLAINT TABLE ================= */}

        {activeTab ===
        "complaints" && (

          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b flex justify-between items-center">

              <h2 className="text-xl font-bold text-[#6d0f16]">

                Hostel Complaints

              </h2>

              <span className="text-sm text-gray-500">

                {
                  complaints.length
                }
                {" "}
                Complaints

              </span>

            </div>

            {complaints.length ===
            0 ? (

              <div className="p-16 text-center text-gray-500">

                No complaints found

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50 border-b">

                    <tr className="text-left text-sm text-gray-500">

                      <th className="px-6 py-4">

                        Student

                      </th>

                      <th className="px-6 py-4">

                        Hostel

                      </th>

                      <th className="px-6 py-4">

                        Complaint

                      </th>

                      <th className="px-6 py-4">

                        Status

                      </th>

                      <th className="px-6 py-4">

                        Date

                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {complaints.map(
                      (comp) => (

                        <tr
                          key={comp.id}
                          className="border-b hover:bg-gray-50"
                        >

                          <td className="px-6 py-5">

                            <div>

                              <h3 className="font-semibold text-gray-800">

                                {
                                  comp.student_name ||
                                  "-"
                                }

                              </h3>

                              <p className="text-sm text-gray-500">

                                {
                                  comp.student_roll_no ||
                                  "-"
                                }

                              </p>

                            </div>

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-700">

                            {
                              comp.hostel ||
                              "-"
                            }

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-700 max-w-md">

                            <div>

                              <p className="font-semibold">

                                {
                                  comp.title ||
                                  "Complaint"
                                }

                              </p>

                              <p className="text-gray-500 mt-1 line-clamp-2">

                                {
                                  comp.description
                                }

                              </p>

                            </div>

                          </td>

                          <td className="px-6 py-5">

                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              comp.status ===
                              "resolved"

                                ? "bg-green-100 text-green-700"

                                : "bg-yellow-100 text-yellow-700"
                            }`}>

                              {
                                comp.status
                              }

                            </span>

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">

                            {comp.date_created
                              ? new Date(
                                  comp.date_created
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Warden;