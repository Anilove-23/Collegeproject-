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

  const inferRole = (role, emailValue) => {
    const normalizedEmail = String(emailValue || "").toLowerCase();

    if (normalizedEmail.includes("attendant") || normalizedEmail.includes("att_")) return "attendant";
    if (normalizedEmail.includes("chief")) return "chief-warden";
    if (normalizedEmail.includes("warden")) return "warden";
    if (normalizedEmail.includes("guard")) return "guard";
    if (normalizedEmail.includes("gate")) return "guard";

    return role || "student";
  };

  /* ================= REDIRECT ================= */

  const getRedirectPath = (role) => {

    switch (role) {

      case "student":
        return "/student";

      case "attendant":
        return "/attendant";

      case "guard":
        return "/guard";

      case "warden":
        return "/warden";

      case "chief-warden":
        return "/chief-warden";

      default:
        return "/student";
    }
  };

  /* ================= STATE ================= */

  const [formData, setFormData] =
    useState({

      email: "",

      password: "",

      // role: "student",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [otpPending, setOtpPending] =
    useState(false);

  const [otpRole, setOtpRole] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [otpCountdown, setOtpCountdown] =
    useState(0);

  useEffect(() => {
    if (!otpPending || otpCountdown <= 0) return;

    const timer = window.setTimeout(() => {
      setOtpCountdown((count) => count - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpPending, otpCountdown]);

  /* ================= HANDLE CHANGE ================= */

  const getMachineId = () => {
    let machineId = localStorage.getItem('GATE_MACHINE_ID');
    if (!machineId) {
      machineId = 'GATE_MAC_' + crypto.randomUUID();
      localStorage.setItem('GATE_MACHINE_ID', machineId);
    }
    return machineId;
  };
  const handleChange = (e) => {
    if (e.target.name === "email" || e.target.name === "password") {
      setOtpPending(false);
      setOtp("");
      setOtpCountdown(0);
    }

    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  const persistAuth = (data, normalizedRole) => {
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("role", normalizedRole);

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...data.user,
        token: data.token,
        role: normalizedRole,
      })
    );

    navigate(getRedirectPath(normalizedRole));
  };

  const submitLoginRequest = async () => {
    const loginRole = inferRole("student", formData.email);

    const headers = {
      "Content-Type": "application/json",
    };

    if (loginRole === "guard") {
      headers["X-Machine-ID"] = getMachineId();
    }

    const data =
      (await apiFetch("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: loginRole,
        }),
      })) || {};

    if (data?.success && data?.message === "OTP generated") {
      setOtpPending(true);
      setOtpRole(loginRole);
      setOtp("");
      setOtpCountdown(60);
      setError("");
      return { requiresOtp: true };
    }

    const role = data?.role || "student";
    const normalizedRole = inferRole(role, formData.email);

    if (data?.token) {
      persistAuth(data, normalizedRole);
      return { success: true };
    }

    throw new Error(data?.message || "Login failed");
  };

  /* ================= LOGIN ================= */

  const handleLogin =
    async (e) => {

      e.preventDefault();

      if (
        !formData.email ||
        !formData.password
      ) {

        setError(
          "Please fill all fields"
        );

        return;
      }

      try {

        setLoading(true);

        setError("");

        await submitLoginRequest();

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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        (await apiFetch("/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            email: formData.email,
            otp,
            role: otpRole || inferRole("student", formData.email),
          }),
        })) || {};

      if (!data?.token) {
        throw new Error(data?.message || "OTP verification failed");
      }

      const role = data?.role || "student";
      const normalizedRole = inferRole(role, formData.email);
      persistAuth(data, normalizedRole);
    } catch (err) {
      console.error(err);
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await submitLoginRequest();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to resend OTP");
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

          {/* <select
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

          </select> */}

          {otpPending && (
            <div className="mb-5">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full border border-gray-300 p-3 rounded-md mb-3 outline-none focus:border-[#5b0e0e]"
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || !otp}
                  className="flex-1 bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || otpCountdown > 0}
                  className="flex-1 border border-[#5b0e0e] text-[#5b0e0e] hover:bg-[#f7eaea] transition py-3 rounded-md disabled:opacity-50"
                >
                  {loading
                    ? "Sending..."
                    : otpCountdown > 0
                      ? `Resend OTP (${otpCountdown}s)`
                      : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {/* BUTTON */}

          {!otpPending && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
            >

              {loading
                ? "Logging in..."
                : "Login"}

            </button>
          )}

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
