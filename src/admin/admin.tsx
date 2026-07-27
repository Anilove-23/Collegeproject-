import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  name: string;
  hostel: string;
  role: string;
  avatarUrl: string;
}

interface Outpass {
  id: number;
  destination: string;
  reason: string;
  outpass_type: string;
  date_from: string;
  date_to: string;
  room: string;
  status: string;
  student_name: string;
  student_room: string;
  student_phone: string;
}

interface Complaint {
  id: number;
  title: string;
  description: string;
  status: string;
  date_created: string;
  priority?: string;
  student_name: string;
  student_room: string;
  student_phone: string;
}

interface StoredUser {
  token: string;
  role: string;
}

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'outpass' | 'complaints'>('outpass');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      const storedUserStr = localStorage.getItem('user');
      if (!storedUserStr) {
        navigate('/');
        return;
      }

      const storedUser: StoredUser = JSON.parse(storedUserStr);

      if (!storedUser?.token || storedUser.role !== 'attendant') {
        navigate('/');
        return;
      }

      try {
        // Fetch attendant data
        const userResponse = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
            role: storedUser.role,
          },
        });

        if (!userResponse.ok) {
          setError('Failed to load user data');
          setLoading(false);
          return;
        }

        const userData = await userResponse.json();
        const attendant = userData.user;

        setAdminUser({
          name: attendant.name,
          hostel: attendant.hostel,
          role: 'Attendant',
          avatarUrl: `https://ui-avatars.com/api/?name=${attendant.name}&background=ffffff&color=5b0e0e`,
        });

        // Fetch outpasses filtered by hostel
        const outpassResponse = await fetch(
          `http://localhost:5000/outpass/by-hostel?hostel=${encodeURIComponent(attendant.hostel)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${storedUser.token}`,
              role: storedUser.role,
            },
          }
        );

        if (outpassResponse.ok) {
          const outpassData = await outpassResponse.json();
          setOutpasses(outpassData.outpasses || []);
        }

        // Fetch complaints filtered by hostel
        const complaintResponse = await fetch(
          `http://localhost:5000/complaint/by-hostel?hostel=${encodeURIComponent(attendant.hostel)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${storedUser.token}`,
              role: storedUser.role,
            },
          }
        );

        if (complaintResponse.ok) {
          const complaintData = await complaintResponse.json();
          setComplaints(complaintData.complaints || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Could not connect to server');
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleApproveOutpass = async (id: number) => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) return;
    
    const storedUser: StoredUser = JSON.parse(storedUserStr);
    try {
      const response = await fetch('http://localhost:5000/outpass/update-outpass', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedUser.token}`,
          role: storedUser.role,
        },
        body: JSON.stringify({ outpass_id: id, status: 'approved' }),
      });

      if (response.ok) {
        setOutpasses(outpasses.filter(o => o.id !== id));
      } else {
        alert('Failed to approve outpass');
      }
    } catch (err) {
      console.error('Error approving outpass:', err);
      alert('Could not connect to server');
    }
  };

  const handleRejectOutpass = async (id: number) => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) return;
    
    const storedUser: StoredUser = JSON.parse(storedUserStr);
    try {
      const response = await fetch('http://localhost:5000/outpass/update-outpass', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedUser.token}`,
          role: storedUser.role,
        },
        body: JSON.stringify({ outpass_id: id, status: 'rejected' }),
      });

      if (response.ok) {
        setOutpasses(outpasses.filter(o => o.id !== id));
      } else {
        alert('Failed to reject outpass');
      }
    } catch (err) {
      console.error('Error rejecting outpass:', err);
      alert('Could not connect to server');
    }
  };

  const handleResolveComplaint = async (id: number) => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) return;
    
    const storedUser: StoredUser = JSON.parse(storedUserStr);
    try {
      const response = await fetch('http://localhost:5000/complaint/update-complaint', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedUser.token}`,
          role: storedUser.role,
        },
        body: JSON.stringify({ complaint_id: id, status: 'resolved' }),
      });

      if (response.ok) {
        setComplaints(complaints.filter(c => c.id !== id));
      } else {
        alert('Failed to resolve complaint');
      }
    } catch (err) {
      console.error('Error resolving complaint:', err);
      alert('Could not connect to server');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] text-[#5b0e0e] font-semibold">
        Loading admin panel...
      </div>
    );
  }

  if (error || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-2">{error || 'Failed to load admin panel'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-[#5b0e0e] text-white px-4 py-2 rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <nav className="w-full bg-[#5b0e0e] text-white shadow-md px-6 py-4 flex justify-between items-center z-10 sticky top-0">
         <div className="flex items-center gap-3 justify-center ">
  <img
    src="l.png"
    alt="nithlogo"
    width={60}
    height={60}
    className="object-contain"
  />

  <h1 className="text-2xl font-bold">
   Admin Panel
  </h1>
</div>
        
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-[#741616] px-4 py-2 rounded-full border border-[#8a1a1a]">
            <img 
              src={adminUser.avatarUrl} 
              alt="Admin Avatar" 
              className="w-8 h-8 rounded-full shadow-sm"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold leading-tight">{adminUser.name}</span>
              <span className="text-[10px] text-gray-300 uppercase tracking-wider">{adminUser.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white text-[#5b0e0e] hover:bg-gray-100 px-5 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-[72px] z-0">
        <div className="max-w-5xl mx-auto px-4 flex space-x-8">
          <button 
            className={`py-4 text-sm font-bold border-b-4 transition-colors duration-200 flex items-center gap-2 ${
              activeTab === 'outpass' 
                ? 'border-[#5b0e0e] text-[#5b0e0e]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('outpass')}
          >
            Pending Outpasses
            {outpasses.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'outpass' ? 'bg-[#5b0e0e] text-white' : 'bg-red-100 text-red-600'}`}>
                {outpasses.length}
              </span>
            )}
          </button>
          
          <button 
            className={`py-4 text-sm font-bold border-b-4 transition-colors duration-200 flex items-center gap-2 ${
              activeTab === 'complaints' 
                ? 'border-[#5b0e0e] text-[#5b0e0e]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('complaints')}
          >
            Active Complaints
            {complaints.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'complaints' ? 'bg-[#5b0e0e] text-white' : 'bg-red-100 text-red-600'}`}>
                {complaints.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 flex flex-col space-y-6">
        {activeTab === 'outpass' && (
          <>
            {outpasses.length > 0 ? (
              outpasses.map((pass) => (
                <div key={pass.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{pass.destination}</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium border border-gray-200">
                        Room {pass.room}
                      </span>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-sm"><span className="font-semibold text-blue-900">Student:</span> {pass.student_name}</p>
                      <p className="text-sm"><span className="font-semibold text-blue-900">Room:</span> {pass.student_room}</p>
                      <p className="text-sm"><span className="font-semibold text-blue-900">Phone:</span> {pass.student_phone}</p>
                    </div>
                    
                    <p className="text-gray-800 font-semibold mb-1">Reason: <span className="font-normal">{pass.reason}</span></p>
                    <p className="text-gray-600 text-sm mb-4">Type: {pass.outpass_type}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                      <div><span className="font-semibold text-gray-500 block text-xs uppercase">From</span>{new Date(pass.date_from).toLocaleDateString()}</div>
                      <div><span className="font-semibold text-gray-500 block text-xs uppercase">To</span>{new Date(pass.date_to).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleApproveOutpass(pass.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md font-semibold transition shadow-sm"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectOutpass(pass.id)}
                      className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-md font-semibold transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">There are no pending outpass requests for {adminUser.hostel}.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'complaints' && (
          <>
            {complaints.length > 0 ? (
              complaints.map((comp) => (
                <div key={comp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col  gap-3 mb-3">
                      <h2 className="text-xl font-bold text-gray-800">Title:{comp.title}</h2>
                      <h3 className="text-lg font-semibold text-gray-700">Subject: {comp.description}</h3>
                      {comp.priority === 'high' && (
                         <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold border border-red-200 uppercase">High Priority</span>
                      )}
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                      <p className="text-sm"><span className="font-semibold text-purple-900">Student:</span> {comp.student_name}</p>
                      <p className="text-sm"><span className="font-semibold text-purple-900">Room:</span> {comp.student_room}</p>
                      <p className="text-sm"><span className="font-semibold text-purple-900">Phone:</span> {comp.student_phone}</p>
                    </div>
                    
                    <p className="text-gray-600 mb-4">Status: {comp.status}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 font-medium">
                        Date: {new Date(comp.date_created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleResolveComplaint(comp.id)}
                      className="bg-[#5b0e0e] hover:bg-[#741616] text-white px-8 py-3 rounded-md font-semibold transition shadow-sm whitespace-nowrap"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="text-5xl mb-4">🛠️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Complaints!</h3>
                <p className="text-gray-500">The hostel is running smoothly.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
