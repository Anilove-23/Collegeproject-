import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Outpass1() {
  const navigate = useNavigate();
  const [type, setType] = useState("local");
  const [status, setStatus] = useState("idle"); // idle | pending | approved | error
  const [error, setError] = useState("");
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.reason) {
      setError("Please fill reason");
      return;
    }

    if (type === "outstation") {
      if (!formData.destination || !formData.date_from || !formData.date_to) {
        setError("Please fill all required fields for outstation outpass");
        return;
      }

      if (new Date(formData.date_from) >= new Date(formData.date_to)) {
        setError("Return date must be after departure date");
        return;
      }
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.token) {
      navigate("/");
      return;
    }

    try {
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
        setError(data.message || "Failed to submit outpass application");
        setStatus("error");
        return;
      }

      navigate("/outpass");
    } catch (err) {
      console.error("Outpass submission failed:", err);
      setError("Could not connect to server");
      setStatus("error");
    }
  };

  const resetForNew = () => {
    setStatus("idle");
    setType("local");
    setFormData({ reason: "", destination: "", date_from: "", date_to: "" });
    setError("");
  };

  const inputStyles = "w-full border border-gray-300 p-3 rounded-md mt-1 outline-none focus:border-[#5b0e0e] focus:ring-1 focus:ring-[#5b0e0e] transition-colors text-gray-800 bg-white";

  return (
    <div className="min-h-[80vh] bg-[#f5f5f5] flex items-center justify-center p-4">
      
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10 transition-all">
        
        {/* === IDLE STATE (THE FORM) === */}
        {status === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-8 border-b border-gray-100 pb-6">
              <h1 className="text-3xl font-bold text-[#5b0e0e]">
                Outpass Application
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Fill out the details below to request a hostel outpass.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Outpass Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputStyles}
              >
                <option value="local">Local (Market / Nearby)</option>
                <option value="outstation">Outstation (Home / Other City)</option>
              </select>
            </div>

            {/* Outstation Extra Fields */}
            {type === "outstation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Place of Visit</label>
                  <input
                    required
                    type="text"
                    name="destination"
                    placeholder="e.g. Chandigarh"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className={inputStyles}
                  />
                </div>
              
              </div>
            )}

        
              <div>
                <label className="block text-sm font-semibold text-gray-700">Reason for Outpass</label>
                <textarea
                  required
                  name="reason"
                  placeholder="e.g. Visit market, attend appointment"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={inputStyles + " resize-none h-20"}
                />
              </div>
          

            {/* Date Fields - Only for Outstation */}
            {type === "outstation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Departure Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    name="date_from"
                    value={formData.date_from}
                    onChange={handleInputChange}
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Expected Return Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    name="date_to"
                    value={formData.date_to}
                    onChange={handleInputChange}
                    className={inputStyles}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#5b0e0e] hover:bg-[#741616] text-white py-3 rounded-md font-semibold mt-8 transition-colors duration-200 shadow-sm"
            >
              Submit Application
            </button>
          </form>
        )}


        {/* === ERROR STATE === */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mb-2">
              ✕
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Submission Failed</h2>
            <p className="text-gray-600 max-w-xs mx-auto">
              {error}
            </p>
            <button 
              onClick={resetForNew}
              className="text-[#5b0e0e] hover:underline font-medium mt-4 text-sm"
            >
              &larr; Back to Application
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Outpass1;