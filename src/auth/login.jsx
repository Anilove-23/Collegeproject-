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

function Login() {

  const navigate =
    useNavigate();

  /* ================= REDIRECT ================= */

  const getRedirectPath = (
    role,
    authorityLevel
  ) => {

    switch (role) {

      case "guard":
        return "/guard";

      case "attendant":
        return "/attendant";

      case "warden":
        // Same role string covers Warden/Chief Warden/Super Admin (see
        // roomAccess.js authority_level scheme); only level 2 is "the Warden"
        // and lands on their existing dashboard. Levels 1/3 use the Admin Panel.
        return authorityLevel === 2 ? "/warden" : "/admin";

      case "student":
      default:
        return "/student";
    }
  };

  /* ================= STATE ================= */

  const [formData, setFormData] =
    useState({

      email: "",

      password: "",

      role: "student",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= CHECK AUTH ================= */

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    const role =
      localStorage.getItem(
        "role"
      );

    if (
      token &&
      role
    ) {

      let authorityLevel;
      try {
        authorityLevel = JSON.parse(localStorage.getItem("user") || "{}")?.authority_level;
      } catch {
        authorityLevel = undefined;
      }

      navigate(
        getRedirectPath(role, authorityLevel)
      );
    }

  }, [navigate]);

  /* ================= LOGIN ================= */

  const handleLogin =
    async (e) => {

      e.preventDefault();

      if (
        !formData.email ||
        !formData.password ||
        !formData.role
      ) {

        setError(
          "Please fill all fields"
        );

        return;
      }

      try {

        setLoading(true);

        setError("");

        const data =
          await apiFetch(
            "/api/auth/login",
            {
              method: "POST",

              body: JSON.stringify({

                email:
                  formData.email,

                password:
                  formData.password,

                role:
                  formData.role,
              }),
            }
          );

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "role",
          formData.role
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );

        navigate(
          getRedirectPath(
            formData.role,
            data.user?.authority_level
          )
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Login failed"
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

          <div className="flex items-center gap-3 justify-center mb-5">

            <img
              src="/l.png"
              alt="nithlogo"
              width={80}
              height={80}
              className="object-contain"
            />

            <h1 className="text-5xl font-bold">

              Hostel Management

            </h1>

          </div>

          <p className="text-lg text-gray-200 leading-8">

            Smart hostel administration system for
            outpass management, complaints and
            student monitoring.

          </p>

        </div>

      </div>

      {/* ================= RIGHT ================= */}

      <div className="flex w-full md:w-1/2 items-center justify-center px-6">

        <form
          onSubmit={handleLogin}
          className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 p-10"
        >

          <h2 className="text-3xl font-semibold text-[#5b0e0e] mb-8 text-center">

            Login

          </h2>

          {/* ERROR */}

          {error && (

            <p className="text-red-500 text-sm mb-4">

              {error}

            </p>
          )}

          {/* EMAIL */}

          <input
            type="email"
            name="email"
            placeholder="College Mail"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
          />

          {/* PASSWORD */}

          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md mb-5 outline-none focus:border-[#5b0e0e]"
          />

          {/* ROLE */}

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

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

          {/* SIGNUP */}

          <p className="text-center text-gray-600 mt-6">

            Don&apos;t have an account?{" "}

            <Link
              to="/signup"
              className="text-[#5b0e0e] font-medium hover:underline"
            >

              Signup

            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;
