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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] text-[#5b0e0e] font-semibold">
        Loading student profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-[#5b0e0e] text-white px-4 py-2 rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData?.name || "Student")}&background=f5f5f5&color=5b0e0e&size=150`;

  const handleComplaint = () => {
    // navigate("/complaint");
    alert("Redirecting to Complaint Portal");
    navigate("/complaint");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      
      {/* Full-Width Maroon Navbar */}
      <nav className="w-full bg-[#5b0e0e] text-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 justify-center ">
  <img
    src="l.png"
    alt="nithlogo"
    width={60}
    height={60}
    className="object-contain"
  />

  <h1 className="text-2xl font-bold">
    Hostel Management
  </h1>
</div>
        
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={handleComplaint}
            className="hover:bg-[#741616] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Complaint
          </button>
          
          <button
            onClick={handleOutpass}
            className="hover:bg-[#741616] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Outpass
          </button>

          {/* Logout button styled distinctly to stand out */}
          <button
            onClick={handleLogout}
            className="bg-white text-[#5b0e0e] hover:bg-gray-100 px-5 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200 ml-2"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex justify-center py-10 px-4">
        
        {/* Profile Card */}
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          
          {/* Banner Section */}
          <div className="bg-gray-100 border-b border-gray-200 h-32 relative"></div>

          {/* Profile Info Header */}
          <div className="px-8 pb-8 relative">
            {/* Photograph */}
            <div className="absolute -top-16 border-4 border-white rounded-full bg-white shadow-md">
              <img
                src={photoUrl}
                alt="Student Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>

            {/* Name & Roll No */}
            <div className="ml-40 pt-4">
              <h2 className="text-3xl font-bold text-gray-800">
                {studentData.name}
              </h2>
              <p className="text-[#5b0e0e] font-medium text-lg mt-1">
                {studentData.email}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Details Grid Section */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-[#5b0e0e] mb-6 border-b-2 border-[#5b0e0e] inline-block pb-1">
              Student Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              {/* Room Info */}
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Room No</span>
                <span className="text-gray-800 font-semibold">{studentData.room}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Hostel</span>
                <span className="text-gray-800 font-semibold">{studentData.hostel}</span>
              </div>

              {/* Personal Info */}
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Department</span>
                <span className="text-gray-800 font-semibold">{studentData.department}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">Mobile Number</span>
                <span className="text-gray-800 font-semibold">{studentData.phone}</span>
              </div>

              <div className="flex flex-col md:col-span-2 lg:col-span-3 mt-2">
                <span className="text-sm text-gray-500 font-medium">Account Role</span>
                <span className="text-gray-800 font-semibold bg-gray-50 p-3 rounded-md border border-gray-100 mt-1">
                  {studentData.role || "student"}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Student;