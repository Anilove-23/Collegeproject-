import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Outpass() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOutpasses() {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!storedUser?.token || !storedUser?.role) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/outpass/my-outpasses', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
            role: storedUser.role,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load outpasses');
          setLoading(false);
          return;
        }

        setOutpasses(data.outpasses || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch outpasses:', err);
        setError('Could not connect to server');
        setLoading(false);
      }
    }

    fetchOutpasses();
  }, [navigate]);

  const pendingRequests = outpasses.filter(o => o.status === 'pending');
  const rejectedRequests = outpasses.filter(o => o.status === 'rejected');
  const approvedRequests = outpasses.filter(o => o.status === 'approved');
  const displayRequests = activeTab === 'pending' ? pendingRequests : activeTab === 'rejected' ? rejectedRequests : approvedRequests;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          dot: 'bg-amber-400',
          icon: '⏳',
        };
      case 'rejected':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
          icon: '✕',
        };
      case 'approved':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
          icon: '✓',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200',
          dot: 'bg-gray-400',
          icon: '•',
        };
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingRequests.length, color: 'text-amber-600' },
    { id: 'approved', label: 'Approved', count: approvedRequests.length, color: 'text-emerald-600' },
    { id: 'rejected', label: 'Rejected', count: rejectedRequests.length, color: 'text-rose-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-crimson/20 border-t-crimson animate-spin" />
          <p className="text-text-secondary font-medium">Loading your outpasses…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-md border border-border p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-text-primary mb-1">Something went wrong</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/student')}
            className="bg-crimson hover:bg-crimson-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* ── Navbar ── */}
      <nav className="w-full bg-crimson text-white shadow-lg px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="l.png" alt="logo" width={48} height={48} className="object-contain rounded-md" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Hostel Management</h1>
            <p className="text-xs text-white/60 font-medium tracking-wide">NIT Hamirpur</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/student")}
            className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/complaint")}
            className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150"
          >
            Complaints
          </button>
          <button
            onClick={handleLogout}
            className="ml-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Page Header ── */}
      <div className="w-full bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Outpass Requests</h2>
            <p className="text-text-secondary text-sm mt-0.5">Manage and track your hostel outpass applications</p>
          </div>
          <button
            onClick={() => navigate("/apply-outpass")}
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Outpass
          </button>
        </div>

        {/* Stats Row */}
        <div className="max-w-4xl mx-auto px-6 pb-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', count: pendingRequests.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Approved', count: approvedRequests.length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Rejected', count: rejectedRequests.length, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl px-4 py-3`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs font-medium text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="w-full bg-card border-b border-border sticky top-[68px] z-40">
        <div className="max-w-4xl mx-auto px-6 flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-crimson text-white'
                  : 'bg-gray-100 text-text-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 max-w-4xl w-full mx-auto py-6 px-6 flex flex-col gap-4">
        {displayRequests.length > 0 ? (
          displayRequests.map(request => {
            const cfg = getStatusConfig(request.status);
            return (
              <div
                key={request.id || request._id}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                {/* Card Top Bar */}
                <div className={`h-1 w-full ${cfg.dot}`} />

                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center text-base`}>
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-text-primary truncate">
                          {request.destination || 'Local'}
                        </h3>
                        <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                          {request.reason}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  {/* Date Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-canvas rounded-xl p-3 border border-border">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Departure</p>
                      <p className="text-sm font-semibold text-text-primary">{formatDate(request.date_from)}</p>
                    </div>
                    <div className="bg-canvas rounded-xl p-3 border border-border">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Return</p>
                      <p className="text-sm font-semibold text-text-primary">{formatDate(request.date_to)}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Applied {formatDateTime(request.date_created)}
                    </div>
                    <button className="text-crimson text-xs font-bold hover:underline flex items-center gap-1 transition-all duration-150 group-hover:gap-2">
                      View Pass
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-5 border border-border">
              {activeTab === 'pending' ? '⏳' : activeTab === 'approved' ? '✅' : '❌'}
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              No {activeTab} requests
            </h3>
            <p className="text-text-secondary text-sm max-w-xs">
              You don't have any {activeTab} outpass requests at the moment.
              {activeTab === 'pending' && (
                <> Click <strong>"Apply for Outpass"</strong> to get started.</>
              )}
            </p>
            {activeTab === 'pending' && (
              <button
                onClick={() => navigate("/apply-outpass")}
                className="mt-6 inline-flex items-center gap-2 bg-crimson hover:bg-crimson-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Apply for Outpass
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Outpass;