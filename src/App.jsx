import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Login from "./auth/login";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [authorityLevel, setAuthorityLevel] = useState(undefined);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      if (token && storedRole) {
        setIsLoggedIn(true);
        setRole(storedRole);

        try {
          setAuthorityLevel(JSON.parse(localStorage.getItem("user") || "{}")?.authority_level);
        } catch {
          setAuthorityLevel(undefined);
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-5 text-gray-600 font-medium">
            Loading Application...
          </p>
        </div>
      </div>
    );
  }

  /* ================= LOGIN ================= */
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />;
  }

  /* ================= ROLE REDIRECTS ================= */
  switch (role) {
    case "student":
      return <Navigate to="/student" replace />;

    case "attendant":
      return <Navigate to="/attendant" replace />;

    case "guard":
      return <Navigate to="/guard" replace />;
      
    // Added new roles for Room Management Module.
    // Same role string covers Warden/Chief Warden/Super Admin (see
    // roomAccess.js authority_level scheme); only level 2 is "the Warden"
    // and lands on their existing dashboard. Levels 1/3 use the Admin Panel.
    case "warden":
      return <Navigate to={authorityLevel === 2 ? "/warden" : "/admin"} replace />;

    case "chief_warden":
      return <Navigate to="/chief-warden" replace />;

    case "admin":
      return <Navigate to="/admin" replace />;

    default:
      /* INVALID ROLE */
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="bg-white border shadow-xl rounded-3xl p-10 max-w-md text-center">
            <h1 className="text-4xl font-bold text-red-600">Invalid Role</h1>
            <p className="text-gray-500 mt-3">
              Your session role is invalid or expired.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-[#6d0f16] hover:bg-[#530b11] text-white px-6 py-3 rounded-2xl transition"
            >
              Login Again
            </button>
          </div>
        </div>
      );
  }
}