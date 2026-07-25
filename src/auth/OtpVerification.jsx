import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      const role = data.role || "student";
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data.user,
          token: data.token,
          role,
        })
      );

      navigate(getRedirectPath(role));
    } catch (err) {
      console.error(err);
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-6">
      <form
        onSubmit={handleVerify}
        className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 p-10"
      >
        <h2 className="text-3xl font-semibold text-[#5b0e0e] mb-4 text-center">
          Verify OTP
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter the 6-digit OTP sent to your email.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          maxLength={6}
          className="w-full border border-gray-300 p-3 rounded-md mb-4 outline-none focus:border-[#5b0e0e]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5b0e0e] hover:bg-[#741616] transition text-white py-3 rounded-md disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}

export default OtpVerification;
