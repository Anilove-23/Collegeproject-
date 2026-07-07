import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  apiFetch,
} from "../utils/api";

function Signup() {

  const navigate =
    useNavigate();

  /* ================= STATE ================= */

  const [hostels, setHostels] =
    useState([]);

  const [formData, setFormData] =
    useState({

      name: "",

      email: "",

      password: "",

      confirmPassword: "",

      phone: "",

      hostel: "",

      room: "",

      department: "",

      rollno: "",

      role: "student",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* ================= FLAGS ================= */

  const isStudent =
    formData.role === "student";

  const showHostelField =
    formData.role === "student" ||
    formData.role === "attendant";

  /* ================= HOSTELS ================= */

  useEffect(() => {

    async function fetchHostels() {

      try {

        const data =
          await apiFetch(
            "/api/hostels"
          );

        setHostels(
          data.hostels ||
          data.data ||
          []
        );

      } catch (err) {

        console.error(
          "Failed to fetch hostels:",
          err
        );
      }
    }

    fetchHostels();

  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= REDIRECT ================= */

  const getRedirectPath = (
    role
  ) => {

    switch (role) {

      case "guard":
        return "/guard";

      case "attendant":
        return "/attendant";
      case "warden":
        return "/wardenhostel";

      case "student":
      default:
        return "/student";
    }
  };

  /* ================= SIGNUP ================= */

  const handleSignup =
    async (e) => {

      e.preventDefault();

      if (isStudent) {

        if (
          !formData.name ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword ||
          !formData.phone ||
          !formData.hostel ||
          !formData.room ||
          !formData.department ||
          !formData.rollno
        ) {

          setError(
            "Please fill all fields"
          );

          return;
        }

      } else {

        if (
          !formData.name ||
          !formData.email ||
          !formData.phone ||
          !formData.password ||
          !formData.confirmPassword
        ) {

          setError(
            "Please fill all fields"
          );

          return;
        }

        if (
          showHostelField &&
          !formData.hostel
        ) {

          setError(
            "Please select a hostel"
          );

          return;
        }
      }

      if (
        !formData.email.endsWith(
          "@nith.ac.in"
        )
      ) {

        setError(
          "Use your college email"
        );

        return;
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {

        setError(
          "Passwords do not match"
        );

        return;
      }

      try {

        setLoading(true);

        setError("");

        let payload;

        if (
          formData.role === "student"
        ) {

          payload = {

            role: "student",

            name: formData.name,

            email: formData.email,

            password:
              formData.password,

            phone: formData.phone,

            hostel:
              formData.hostel,

            room: formData.room,

            department:
              formData.department,

            rollno:
              formData.rollno,
          };
        }

        else if (
          formData.role === "attendant"
        ) {

          payload = {

            role: "attendant",

            name: formData.name,

            email: formData.email,

            password:
              formData.password,

            phone: formData.phone,

            hostel:
              formData.hostel,
          };
        }

        else if(formData.role === "guard"){

          payload = {

            role: "guard",

            name: formData.name,

            email: formData.email,

            password:
              formData.password,

            phone: formData.phone,
          }
        }else{
payload = {

            role: "warden",

            name: formData.name,

            email: formData.email,

            password:
              formData.password,

            phone: formData.phone,
            hostel:
              formData.hostel,
          }
          };

        const data =
          await apiFetch(
            "/api/auth/signup",
            {
              method: "POST",

              body: JSON.stringify(
                payload
              ),
            }
          );

        const savedUser = {

          ...(data.user || {}),

          role: payload.role,

          token: data.token,
        };

        localStorage.setItem(
          "token",
          data.token || ""
        );

        localStorage.setItem(
          "role",
          payload.role
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            savedUser
          )
        );

        navigate(
          getRedirectPath(
            payload.role
          )
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Signup failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen flex bg-[#f5f5f5]">

      {/* ================= LEFT ================= */}

      <div className="hidden md:flex w-1/2 bg-[#5b0e0e] text-white items-center justify-center p-16">

        <div>

          <h1 className="text-5xl font-bold mb-5">

            Create Account

          </h1>

          <p className="text-lg text-gray-200 leading-8">

            Register to access hostel services,
            outpass requests and complaint management.

          </p>

        </div>

      </div>

      {/* ================= RIGHT ================= */}

      <div className="flex w-full md:w-1/2 items-center justify-center px-6">

        <form
          onSubmit={handleSignup}
          className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 p-10 max-h-[100vh] overflow-y-auto"
        >

          <h2 className="text-3xl font-semibold text-[#5b0e0e] mb-8 text-center">

            Signup

          </h2>

          {error && (

            <p className="text-red-500 text-sm mb-4">

              {error}

            </p>
          )}

          {/* ================= ROLE ================= */}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-6 outline-none focus:border-[#5b0e0e]"
          >

            <option value="student">

              Student

            </option>

            <option value="attendant">

              Attendant

            </option>

            <option value="guard">

              Security Guard

            </option>
             <option value="warden">

              warden

            </option>

          </select>

          {/* ================= COMMON ================= */}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
          />

          <input
            type="email"
            name="email"
            placeholder="College Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
          />

          {/* ================= STUDENT ================= */}

          {isStudent && (

            <>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              >

                <option value="">

                  Select Department

                </option>

                <option value="CSE">

                  Computer Science & Engineering

                </option>

                <option value="ECE">

                  Electronics & Communication

                </option>

                <option value="ME">

                  Mechanical Engineering

                </option>

                <option value="CE">

                  Civil Engineering

                </option>

                <option value="EE">

                  Electrical Engineering

                </option>

              </select>

              <input
                type="text"
                name="rollno"
                placeholder="Roll Number"
                value={formData.rollno}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

              <input
                type="text"
                name="room"
                placeholder="Room Number"
                value={formData.room}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
              />

            </>
          )}

          {/* ================= HOSTEL ================= */}

          {showHostelField && (

            <select
              name="hostel"
              value={formData.hostel}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
            >

              <option value="">

                Select Hostel

              </option>

              {hostels.map((hostel) => (

                <option
                  key={hostel.id || hostel.name}
                  value={hostel.name}
                >

                  {hostel.name}

                </option>
              ))}

            </select>
          )}

          {/* ================= PASSWORD ================= */}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-5 outline-none focus:border-[#5b0e0e]"
          />

          {/* ================= BUTTON ================= */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

          {/* ================= LOGIN ================= */}

          <p className="text-center text-gray-600 mt-6">

            Already have an account?{" "}

            <Link
              to="/signin"
              className="text-[#5b0e0e] font-medium"
            >

              Login

            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Signup;
