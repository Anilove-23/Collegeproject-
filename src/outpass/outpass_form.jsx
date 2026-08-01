import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Outpass1() {
  const navigate = useNavigate();
  const [type, setType] = useState("local");
  const [status, setStatus] = useState("idle"); // idle | error
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    date_from: "",
    date_to: "",
  });
  const [studentInfo, setStudentInfo] = useState({ hostel: "", room: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.hostel && storedUser?.room) {
      setStudentInfo({ hostel: storedUser.hostel, room: storedUser.room });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.reason) {
      setError("Please provide a reason for the outpass.");
      return;
    }

    if (type === "outstation") {
      if (!formData.destination || !formData.date_from || !formData.date_to) {
        setError("Please fill in all fields for an outstation outpass.");
        return;
      }
      if (new Date(formData.date_from) >= new Date(formData.date_to)) {
        setError("Return date must be after the departure date.");
        return;
      }
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.token) {
      navigate("/");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        outpass_type: type,
        reason: formData.reason,
        destination: type === "local" ? "Local" : formData.destination,
        date_from: type === "local" ? new Date().toISOString().split("T")[0] : formData.date_from.split("T")[0],
        date_to: type === "local" ? new Date().toISOString().split("T")[0] : formData.date_to.split("T")[0],
        hostel: studentInfo.hostel,
        room: studentInfo.room,
      };

      const response = await fetch("http://localhost:5000/outpass/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.token}`,
          role: storedUser.role,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit outpass application.");
        setStatus("error");
        setSubmitting(false);
        return;
      }

      navigate("/outpass");
    } catch (err) {
      console.error("Outpass submission failed:", err);
      setError("Could not connect to the server. Please try again.");
      setStatus("error");
      setSubmitting(false);
    }
  };

  const resetForNew = () => {
    setStatus("idle");
    setType("local");
    setFormData({ reason: "", destination: "", date_from: "", date_to: "" });
    setError("");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* ── Slim Back Bar ── */}
      <div className="bg-crimson px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/outpass")}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Outpasses
        </button>
        <span className="text-white/30">|</span>
        <div className="flex items-center gap-2">
          <img src="l.png" alt="logo" width={32} height={32} className="object-contain rounded" />
          <span className="text-white font-bold text-sm">Hostel Management</span>
        </div>
      </div>

      {/* ── Main Centered Form ── */}
      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-lg">

          {/* ── Form Card ── */}
          {status === "idle" && (
            <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-crimson px-8 pt-8 pb-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-3">
                    <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">New Request</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Outpass Application</h1>
                  <p className="text-white/60 text-sm mt-1">Fill in the details to request your hostel outpass.</p>
                </div>
              </div>

              {/* Outpass Type Toggle — floated over border */}
              <div className="-mt-5 mx-8">
                <div className="bg-card border border-border rounded-xl shadow-sm p-1 flex gap-1">
                  {[
                    { value: 'local', label: '🏪 Local', sub: 'Market / Nearby' },
                    { value: 'outstation', label: '✈️ Outstation', sub: 'Home / Other City' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-left transition-all duration-200 ${
                        type === opt.value
                          ? 'bg-crimson text-white shadow-sm'
                          : 'text-text-secondary hover:bg-canvas'
                      }`}
                    >
                      <p className="text-sm font-semibold leading-tight">{opt.label}</p>
                      <p className={`text-[11px] mt-0.5 ${type === opt.value ? 'text-white/70' : 'text-text-muted'}`}>
                        {opt.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

                {/* Outstation Fields */}
                {type === "outstation" && (
                  <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-1.5">
                        Place of Visit
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-text-muted pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <input
                          required
                          type="text"
                          name="destination"
                          placeholder="e.g. Chandigarh, Delhi…"
                          value={formData.destination}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm text-text-primary placeholder-text-muted bg-canvas focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">
                          Departure
                          <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <input
                          required
                          type="datetime-local"
                          name="date_from"
                          value={formData.date_from}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-canvas focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/15 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-1.5">
                          Return
                          <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <input
                          required
                          type="datetime-local"
                          name="date_to"
                          value={formData.date_to}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-primary bg-canvas focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason Field */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Reason for Outpass
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    required
                    name="reason"
                    placeholder="Briefly describe your reason (e.g. visiting market, medical appointment…)"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm text-text-primary placeholder-text-muted bg-canvas resize-none focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/15 transition-all"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                    <span className="text-rose-500 text-lg leading-none mt-0.5">⚠</span>
                    <p className="text-rose-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-crimson hover:bg-crimson-dark disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Application
                    </>
                  )}
                </button>

                {/* Cancel Link */}
                <p className="text-center text-sm text-text-muted">
                  Changed your mind?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/outpass")}
                    className="text-crimson hover:underline font-semibold"
                  >
                    Cancel
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* ── Error State ── */}
          {status === "error" && (
            <div className="bg-card rounded-2xl border border-border shadow-md p-10 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">✕</div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Submission Failed</h2>
              <p className="text-text-secondary text-sm max-w-xs mx-auto mb-6">{error}</p>
              <button
                onClick={resetForNew}
                className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Outpass1;