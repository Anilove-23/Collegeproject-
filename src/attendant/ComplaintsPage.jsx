import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../utils/api";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  // Resolving action state
  const [resolvingId, setResolvingId] = useState(null);
  const [resolvedDescription, setResolvedDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attendant hostel info
  const [hostelName, setHostelName] = useState("");

  // --- Fetch Attendant Hostel and Complaints ---
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User session not found");
      }

      const user = JSON.parse(userStr);
      const hostel = user.hostel;
      setHostelName(hostel || "Your Hostel");

      if (!hostel) {
        throw new Error("Attendant has no assigned hostel");
      }

      // Fetch pending complaints for the attendant's hostel
      const result = await apiFetch(`/complaint/by-hostel?hostel=${encodeURIComponent(hostel)}`);
      setComplaints(result.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
      setError(`Error: ${err.message || "Unknown"}. Raw: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- Resolve Complaint Handler ---
  const resolveComplaint = async (id) => {
    if (!resolvedDescription.trim()) {
      alert("Please enter a resolution description.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiFetch("/complaint/update-complaint", {
        method: "PUT",
        body: JSON.stringify({
          complaint_id: id,
          status: "resolved",
          resolved_description: resolvedDescription.trim(),
        }),
      });

      // Reset state and refresh
      setResolvingId(null);
      setResolvedDescription("");
      await fetchComplaints();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to resolve complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filter and Sort complaints ---
  const processedComplaints = useMemo(() => {
    let arr = [...complaints];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((c) => {
        return (
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.student_name?.toLowerCase().includes(q) ||
          c.student_room?.toLowerCase().includes(q)
        );
      });
    }

    // Category type filter
    if (activeType !== "All") {
      arr = arr.filter((c) => c.type === activeType);
    }

    // Sorting
    if (sortBy === "latest") {
      arr.sort((a, b) => {
        const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
        const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "upvotes") {
      arr.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    return arr;
  }, [complaints, search, activeType, sortBy]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        <div className="w-10 h-10 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading hostel complaints...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-600 text-center font-medium">
        ⚠️ {error}
      </div>
    );
  }

  const categoryTypes = [
    "All",
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Internet/WiFi",
    "Cleanliness",
    "Mess/Food",
    "Other"
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-[#6d0f16]">
            Hostel Complaints ({hostelName})
          </h1>
          <p className="text-gray-500 mt-1">
            Resolve student complaints and track maintenance tasks
          </p>
        </div>

        {/* SEARCH & SORT */}
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search student, room, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-xl text-sm bg-white shadow-sm outline-none focus:border-[#6d0f16] w-64"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-4 py-2 rounded-xl text-sm bg-white shadow-sm outline-none focus:border-[#6d0f16]"
          >
            <option value="latest">Latest</option>
            <option value="upvotes">Most Upvotes</option>
          </select>
        </div>
      </div>

      {/* ================= CATEGORY PILLS ================= */}
      <div className="flex flex-wrap gap-2">
        {categoryTypes.map((type) => {
          const count = type === "All" 
            ? complaints.length 
            : complaints.filter(c => c.type === type).length;

          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200
                ${
                  activeType === type
                    ? "bg-[#6d0f16] text-white border-[#6d0f16] shadow-md"
                    : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                }`}
            >
              {type === "Internet/WiFi" ? "Internet / Wi-Fi" : type} ({count})
            </button>
          );
        })}
      </div>

      {/* ================= COMPLAINTS LIST ================= */}
      {processedComplaints.length === 0 ? (
        <div className="bg-white border rounded-3xl p-16 text-center text-gray-500 shadow-sm">
          No pending complaints found under this category
        </div>
      ) : (
        <div className="space-y-5">
          {processedComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
            >
              {/* TOP HEADER */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-50 pb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800">
                      {c.title || "Untitled Complaint"}
                    </h2>
                    <span className="bg-[#f8eaea] text-[#6d0f16] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#6d0f16]/10">
                      {c.type}
                    </span>
                    {c.upvotes > 0 && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-200">
                        👍 Upvotes: {c.upvotes}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Filed on: {new Date(c.date_created).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* RESOLVING TOGGLE */}
                {resolvingId !== c.id && (
                  <button
                    onClick={() => {
                      setResolvingId(c.id);
                      setResolvedDescription("");
                    }}
                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {/* BODY DESCRIPTION */}
              <p className="text-gray-650 my-5 text-base leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                {c.description}
              </p>

              {/* STUDENT PROFILE CARD */}
              <div className="bg-gray-50 border rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6d0f16] text-white flex items-center justify-center font-bold">
                    {(c.student_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{c.student_name}</p>
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="bg-white border rounded-xl px-3 py-1.5 text-center min-w-[70px]">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Room</p>
                    <p className="font-bold text-gray-800 text-xs mt-0.5">{c.student_room || "-"}</p>
                  </div>

                  <div className="bg-white border rounded-xl px-3 py-1.5 text-center min-w-[100px]">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Phone</p>
                    <p className="font-bold text-gray-800 text-xs mt-0.5">{c.student_phone || "-"}</p>
                  </div>
                </div>
              </div>

              {/* INLINE RESOLUTION FORM */}
              {resolvingId === c.id && (
                <div className="mt-5 p-5 border border-green-100 bg-green-50/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">
                      Resolution Remarks / Solution Details
                    </label>
                    <textarea
                      value={resolvedDescription}
                      onChange={(e) => setResolvedDescription(e.target.value)}
                      placeholder="e.g. Technician replaced the window latch in Room 102."
                      className="w-full border border-gray-200 p-4 rounded-xl outline-none focus:border-green-600 bg-white text-sm shadow-sm"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-2.5 justify-end">
                    <button
                      onClick={() => {
                        setResolvingId(null);
                        setResolvedDescription("");
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 text-xs font-semibold bg-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => resolveComplaint(c.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      {isSubmitting ? "Submitting..." : "Mark Resolved"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
