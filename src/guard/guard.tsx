import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Define the TypeScript Interface for the Outpass data
interface OutpassData {
  id: number;
  student_id: number;
  student_name: string;
  student_room: string;
  student_phone?: string;
  department?: string;
  reason: string;
  outpass_type: string;
  destination: string;
  hostel: string;
  room: string;
  status: string;
  is_exited: boolean;
  is_entered: boolean;
  gate?: string;
}

function Guard() {
  
  // Pull guard info and token from localStorage
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const guardUser = userString ? JSON.parse(userString) : { name: "Guard", role: "Security" };
  const token =  localStorage.getItem('token'); 

  // 2. Apply the interface to the state
  const [outpasses, setOutpasses] = useState<OutpassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedHostel, setSelectedHostel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Fetch Approved Outpasses ---
  useEffect(() => {
    const fetchOutpasses = async () => {
      try {
        // Updated URL to match your Express router setup
        const response = await fetch('http://localhost:5000/outpass/all-approved', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'role': 'guard'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch outpasses');
        
        const data = await response.json();
        setOutpasses(data.outpasses);
      } catch (error) {
        console.error("Error fetching outpasses:", error);
        alert("Failed to load outpasses. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutpasses();
  }, [token]);

  // --- API Handlers (Added number type to ID) ---
  const handleRecordExit = async (outpassId: number) => {
    if (!window.confirm("Record exit for this student?")) return;

    try {
      // Updated URL
      const response = await fetch('http://localhost:5000/outpass/record-entry', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'role': 'guard'
        },
        body: JSON.stringify({
          outpass_id: outpassId,
          action: 'exit',
          gate: 'Main Gate'
        })
      });

      if (!response.ok) throw new Error('Failed to record exit');

      // Update local state to reflect the exit
      setOutpasses(outpasses.map(pass => 
        pass.id === outpassId ? { ...pass, is_exited: true } : pass
      ));
    } catch (error) {
      console.error(error);
      alert("Error recording exit.");
    }
  };

  const handleRecordEntry = async (outpassId: number) => {
    if (!window.confirm("Record entry for this student?")) return;

    try {
      // Updated URL
      const response = await fetch('http://localhost:5000/outpass/record-entry', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'role': 'guard'
        },
        body: JSON.stringify({
          outpass_id: outpassId,
          action: 'enter'
        })
      });

      if (!response.ok) throw new Error('Failed to record entry');

      // Mark as entered
      setOutpasses(outpasses.map(pass => 
        pass.id === outpassId ? { ...pass, is_entered: true } : pass
      ));
      alert("Entry recorded successfully. Outpass completed.");
    } catch (error) {
      console.error(error);
      alert("Error recording entry.");
    }
  };

  // --- Filtering Logic ---
  const activeOutpasses = outpasses.filter(pass => !pass.is_entered);

  const filteredOutpasses = activeOutpasses.filter(pass => {
    const matchesHostel = selectedHostel === 'All' || pass.hostel === selectedHostel;
    
    // Safety check: ensure string exists before calling .toLowerCase()
    const studentName = pass.student_name || "";
    const studentRoom = pass.student_room || "";

    const matchesSearch = 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      studentRoom.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesHostel && matchesSearch; 
  });
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center font-bold text-[#5b0e0e]">Loading Outpasses...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      
      {/* 1. Primary Maroon Navbar */}
      <nav className="w-full bg-[#5b0e0e] text-white shadow-md px-6 py-4 flex justify-between items-center z-10 sticky top-0">
          <div className='text-2xl  font-bold'>
          Guard Dashboard
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold leading-tight">{guardUser.name}</span>
            <span className="text-xs text-gray-300">{guardUser.role}</span>
          </div>
          <div className="w-10 h-10 bg-[#741616] rounded-full flex items-center justify-center font-bold border-2 border-[#8a1a1a] shadow-sm uppercase">
            {guardUser.name ? guardUser.name.charAt(0) : 'G'}
          </div>
           <button
            onClick={handleLogout}
            className="bg-white text-[#5b0e0e] hover:bg-gray-100 px-5 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 2. Search and Filter Controls */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-[72px] z-0">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Hostel</label>
            <select 
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-[#5b0e0e] focus:ring-1 focus:ring-[#5b0e0e] bg-gray-50 text-gray-800 font-medium transition-colors"
            >
              <option value="All">All Hostels</option>
              <option value="Hostel A">Hostel A</option>
              <option value="Hostel B">Hostel B</option>
            </select>
          </div>

          <div className="w-full md:w-2/3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Search Outpass</label>
            <input 
              type="text" 
              placeholder="Search by student name or roll number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md outline-none focus:border-[#5b0e0e] focus:ring-1 focus:ring-[#5b0e0e] bg-gray-50 text-gray-800 transition-colors"
            />
          </div>

        </div>
      </div>

      {/* 3. Main Content Area (Results) */}
      <div className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 flex flex-col space-y-4">
        
        {filteredOutpasses.length > 0 ? (
          filteredOutpasses.map((pass) => {
            const isInsideCampus = !pass.is_exited;

            return (
              <div key={pass.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{pass.student_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase border ${
                      isInsideCampus 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {isInsideCampus ? 'Inside Campus' : 'Out of Campus'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-bold border border-gray-200 uppercase">
                      {pass.outpass_type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 font-medium text-sm mb-2">
                    <span className="font-bold text-gray-800">{pass.student_room}</span> • {pass.hostel}
                  </p>
                  
                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                    <span className="font-semibold text-gray-500 mr-2">Destination:</span> 
                    {pass.destination}
                  </p>
                </div>

                {/* Guard Action Checkboxes */}
                <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-8 items-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8">
                  
                  {/* Exit Box */}
                  <div className={`flex flex-col items-center gap-2 ${isInsideCampus ? '' : 'opacity-50'}`}>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exit</span>
                    <input 
                      type="checkbox" 
                      checked={pass.is_exited}
                      onChange={() => handleRecordExit(pass.id)}
                      disabled={!isInsideCampus}
                      className="w-6 h-6 accent-[#5b0e0e] cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Entry Box */}
                  <div className={`flex flex-col items-center gap-2 ${!isInsideCampus ? '' : 'opacity-50'}`}>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entry</span>
                    <input 
                      type="checkbox"
                      checked={pass.is_entered}
                      onChange={() => handleRecordEntry(pass.id)}
                      disabled={isInsideCampus}
                      className="w-6 h-6 accent-[#5b0e0e] cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No active passes found</h3>
            <p className="text-gray-500">
              Try adjusting your search query or selecting a different hostel.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Guard;