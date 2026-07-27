import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

function Complaint() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('unresolved'); // 'unresolved' | 'resolved' | 'raise'
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track which items the user has upvoted in this session to prevent spamming
  const [upvotedItems, setUpvotedItems] = useState([]);

  // --- Fetch Student's Complaints ---
  const fetchComplaints = async () => {
    try {
      let token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }

      if (!token || !userStr) {
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);

      const response = await fetch('http://localhost:5000/complaint/my-complaints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch complaints');

      const data = await response.json();
      setComplaints(data.complaints);
    } catch (err) {
      console.error(err);
      setError('Could not load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [navigate]);

  // --- Handle Upvote ---
  const handleUpvote = async (complaintId) => {
    let token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
    const user = userStr ? JSON.parse(userStr) : {};

    try {
      // Optimistically update the UI so it feels instant
      setUpvotedItems(prev => [...prev, complaintId]);
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c
      ));

      const response = await fetch('http://localhost:5000/complaint/upvote', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student'
        },
        body: JSON.stringify({ complaint_id: complaintId })
      });

      if (!response.ok) {
        throw new Error('Failed to upvote');
      }
    } catch (err) {
      console.error(err);
      // Revert the optimistic update if the API call fails
      setUpvotedItems(prev => prev.filter(id => id !== complaintId));
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, upvotes: (c.upvotes || 1) - 1 } : c
      ));
      alert("Failed to register upvote. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Filter complaints based on status
  const unresolvedComplaints = complaints.filter(c => c.status === 'pending');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  const displayComplaints = activeTab === 'unresolved' ? unresolvedComplaints : resolvedComplaints;

  const getStatusStyle = (status) => {
    return status === 'pending' 
      ? 'bg-orange-100 text-orange-800 border-orange-200' 
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#6d0f16] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-5 text-gray-600 font-medium">Loading Complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-80 bg-gradient-to-b from-[#6d0f16] to-[#8b0f18] text-white flex flex-col shadow-2xl">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/10">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            🛠️ Complaint Panel
          </h1>
          <p className="text-white/70 mt-2 text-sm">
            Hostel Management Portal
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-5 space-y-3">
          <NavItem
            title="Unresolved"
            active={activeTab === "unresolved"}
            onClick={() => setActiveTab("unresolved")}
          />

          <NavItem
            title="Resolved"
            active={activeTab === "resolved"}
            onClick={() => setActiveTab("resolved")}
          />

          <NavItem
            title="Raise Complaint"
            active={activeTab === "raise"}
            onClick={() => setActiveTab("raise")}
          />

          <NavItem
            title="Outpass Portal"
            active={false}
            onClick={() => navigate("/student")}
          />
        </nav>

        {/* LOGOUT */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-white text-[#6d0f16] font-semibold py-3 rounded-2xl hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-5 max-w-4xl mx-auto">
            {error}
          </div>
        )}

        {activeTab !== 'raise' ? (
          <div className="max-w-5xl mx-auto">
            
            {/* HEADER */}
            <div className="flex flex-wrap justify-between gap-4 mb-8">
              <div>
                <h2 className="text-4xl font-bold text-[#6d0f16]">
                  {activeTab === 'unresolved' ? 'Unresolved Complaints' : 'Resolved Complaints'}
                </h2>
                <p className="text-gray-500 mt-2 text-lg">
                  {activeTab === 'unresolved' ? 'Track your pending hostel issues' : 'View resolved hostel issues'}
                </p>
              </div>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <DashboardCard
                title="Total Filed"
                value={complaints.length}
                subtitle="All complaints"
                icon="📝"
              />
              <DashboardCard
                title="Unresolved"
                value={unresolvedComplaints.length}
                subtitle="Awaiting action"
                icon="⏳"
              />
              <DashboardCard
                title="Resolved"
                value={resolvedComplaints.length}
                subtitle="Closed tickets"
                icon="✅"
              />
              <DashboardCard
                title="Total Upvotes"
                value={complaints.reduce((acc, c) => acc + (c.upvotes || 0), 0)}
                subtitle="Community support"
                icon="👍"
              />
            </div>

            {/* LIST */}
            <div className="space-y-5">
              {displayComplaints.length > 0 ? (
                displayComplaints.map(complaint => (
                  <div 
                    key={complaint.id} 
                    className="bg-white rounded-3xl shadow-sm border border-gray-250 p-6 flex flex-col transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{complaint.title || 'Untitled Complaint'}</h3>
                        {complaint.type && (
                          <span className="inline-block bg-[#f8eaea] text-[#6d0f16] text-xs font-bold px-2.5 py-1 rounded-lg mt-1.5 border border-[#6d0f16]/10">
                            {complaint.type}
                          </span>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${getStatusStyle(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-5 text-base leading-relaxed">{complaint.description}</p>
                    
                    {/* Show Resolution Details if Resolved */}
                    {complaint.status === 'resolved' && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
                        <h4 className="text-sm font-bold text-emerald-800 mb-1">Resolution Update:</h4>
                        <p className="text-sm text-emerald-700">
                          {complaint.resolved_description || "This issue has been marked as resolved by the administration."}
                        </p>
                        {complaint.resolved_at && (
                          <span className="text-xs font-medium text-emerald-600/70 block mt-2">
                            Resolved on: {new Date(complaint.resolved_at).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                          Filed on: {new Date(complaint.date_created).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      {/* UPVOTE BUTTON - Only shows for Pending complaints */}
                      {complaint.status === 'pending' && (
                        <button 
                          onClick={() => handleUpvote(complaint.id)}
                          disabled={upvotedItems.includes(complaint.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border transition-all text-sm font-bold shadow-sm ${
                            upvotedItems.includes(complaint.id)
                              ? 'bg-orange-100 text-orange-800 border-orange-200 cursor-not-allowed opacity-80'
                              : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50 active:bg-orange-100 hover:border-orange-300'
                          }`}
                        >
                          <span>👍</span> 
                          {upvotedItems.includes(complaint.id) ? 'Upvoted' : 'Upvote'} ({complaint.upvotes || 0})
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-16 text-center">
                  <div className="text-6xl mb-4">{activeTab === 'unresolved' ? '🛠️' : '✅'}</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No {activeTab} complaints</h3>
                  <p className="text-gray-500">
                    {activeTab === 'unresolved' 
                      ? "Everything looks good! You don't have any pending issues." 
                      : "You don't have any resolved complaints yet."}
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <RaiseComplaintForm 
            onSuccess={async () => {
              setLoading(true);
              await fetchComplaints();
              setActiveTab('unresolved');
            }}
            onCancel={() => {
              setActiveTab('unresolved');
            }}
          />
        )}

      </main>

    </div>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({
  title,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 font-medium text-lg
      ${
        active
          ? "bg-white text-[#6d0f16] shadow-lg"
          : "hover:bg-white/10 text-white"
      }`}
    >
      {title}
    </button>
  );
}

/* ================= DASHBOARD CARD ================= */
function DashboardCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">
            {title}
          </p>
          <h2 className="text-5xl font-bold text-[#6d0f16] mt-2">
            {value}
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            {subtitle}
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#f8eaea] flex items-center justify-center text-[#6d0f16] text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ================= RAISE COMPLAINT FORM ================= */
function RaiseComplaintForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    let token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    if (!token || !userStr) {
      setError("Session expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const user = JSON.parse(userStr);

    try {
      const response = await fetch('http://localhost:5000/complaint/postcomplaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'role': user.role || 'student' 
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          hostel: user.hostel, 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit complaint');
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full border border-gray-300 p-4 rounded-2xl mt-1.5 outline-none focus:border-[#6d0f16] focus:ring-1 focus:ring-[#6d0f16] transition-all text-gray-800 bg-white shadow-sm hover:border-gray-400 disabled:opacity-50";
  const labelStyles = "block text-xs font-bold text-gray-500 uppercase tracking-wider";

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-150 p-8 md:p-10 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6 border-b border-gray-100 pb-6">
          <h2 className="text-3xl font-bold text-[#6d0f16]">
            Raise a Complaint
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Provide the details of the issue to notify the hostel administration.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold border border-red-100 text-center">
            {error}
          </div>
        )}

        <div>
          <label className={labelStyles}>
            Complaint Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            name="title"
            placeholder="e.g. Broken window latch in Room 102"
            value={formData.title}
            onChange={handleChange}
            className={inputStyles}
            maxLength="100"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className={labelStyles}>
            Complaint Type <span className="text-red-500">*</span>
          </label>
          <select
            required
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={inputStyles}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select Type</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Internet/WiFi">Internet / Wi-Fi</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Mess/Food">Mess / Food</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className={labelStyles}>
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            name="description"
            placeholder="Provide specific details about the issue so we can fix it faster..."
            value={formData.description}
            onChange={handleChange}
            className={inputStyles + " resize-none h-32"}
            maxLength="500"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-1.5">
            <span className={`text-xs font-medium ${formData.description.length >= 480 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.description.length} / 500
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-2">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-1/3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-2/3 bg-[#6d0f16] hover:bg-[#8b0f18] text-white py-3.5 rounded-2xl font-bold transition-colors duration-200 shadow-md shadow-[#6d0f16]/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin text-xl leading-none">↻</span> Submitting...
              </>
            ) : (
              "Submit Complaint"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Complaint;