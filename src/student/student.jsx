import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Student() {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudentProfile() {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser?.token || !storedUser?.role) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
            role: storedUser.role,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load student data");
          setLoading(false);
          return;
        }

        setStudentData(data.user);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load student profile:", err);
        setError("Could not connect to server");
        setLoading(false);
      }
    }

    fetchStudentProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleOutpass = () => {
    // navigate("/outpass");
    alert("Redirecting to Outpass Portal");
    navigate("/outpass");
  };

  const handleComplaint = () => {
    // navigate("/complaint");
    alert("Redirecting to Complaint Portal");
    navigate("/complaint");
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-sm p-8 sm:p-10 max-w-sm w-full flex flex-col items-center text-center">
          <div
            role="status"
            aria-label="Loading"
            className="w-12 h-12 rounded-full border-4 border-[#5b0e0e]/20 border-t-[#5b0e0e] animate-spin mb-5"
          />
          <p className="text-[#5b0e0e] font-semibold text-base sm:text-lg">
            Loading student profile...
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  /* ================= ERROR STATE ================= */

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-3xl mx-auto mb-4">
            !
          </div>
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-6">
            Something went wrong while loading your profile.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-[#5b0e0e] hover:bg-[#741616] active:bg-[#4a0b0b] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5b0e0e] focus:ring-offset-2"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    studentData?.name || "Student"
  )}&background=f5f5f5&color=5b0e0e&size=150`;

  /* ================= INFO FIELDS ================= */

  const infoFields = [
    { label: "Room No", value: studentData.room },
    { label: "Hostel", value: studentData.hostel },
    { label: "Department", value: studentData.department },
    { label: "Mobile Number", value: studentData.phone },
    { label: "Account Role", value: studentData.role || "student" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* ================= NAVBAR ================= */}

      <nav className="w-full bg-[#5b0e0e] text-white shadow-md px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="l.png"
              alt="NIT Hostel logo"
              width={44}
              height={44}
              className="object-contain sm:w-[52px] sm:h-[52px]"
            />
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
              Hostel Management
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
            <NavButton onClick={handleComplaint}>Complaint</NavButton>
            <NavButton onClick={handleOutpass}>Outpass</NavButton>

            {/* Logout button styled distinctly to stand out */}
            <button
              onClick={handleLogout}
              className="bg-white text-[#5b0e0e] hover:bg-gray-100 active:bg-gray-200 px-4 sm:px-5 py-2 rounded-lg font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5b0e0e]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <main className="flex-1 w-full flex justify-center py-6 sm:py-10 px-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          {/* ---- Banner ---- */}
          <div className="bg-gradient-to-r from-[#5b0e0e]/10 to-gray-100 border-b border-gray-200 h-24 sm:h-32 relative" />

          {/* ---- Profile Info Header ---- */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative flex flex-col items-center sm:items-start">
            {/* Photograph */}
            <div className="-mt-14 sm:-mt-16 border-4 border-white rounded-full bg-white shadow-md">
              <img
                src={photoUrl}
                alt={`${studentData.name || "Student"} profile`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
              />
            </div>

            {/* Name & Email */}
            <div className="sm:ml-6 pt-4 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {studentData.name}
              </h2>
              <p className="text-[#5b0e0e] font-medium text-base sm:text-lg mt-1">
                {studentData.email}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* ---- Details Grid Section ---- */}
          <div className="p-5 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-[#5b0e0e] mb-5 sm:mb-6 border-b-2 border-[#5b0e0e] inline-block pb-1">
              Student Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {infoFields.map((field) => (
                <InfoCard key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= NAV BUTTON ================= */

function NavButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="hover:bg-[#741616] active:bg-[#4a0b0b] text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5b0e0e]"
    >
      {children}
    </button>
  );
}

/* ================= INFO CARD ================= */

function InfoCard({ label, value }) {
  return (
    <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow duration-200">
      <span className="text-xs sm:text-sm text-gray-500 font-medium">
        {label}
      </span>
      <span className="text-gray-800 font-semibold mt-1 break-words">
        {value}
      </span>
    </div>
  );
}

export default Student;