import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface OutpassData {
  id: number;
  student_id: number;
  student_name: string;
  student_room: string;
  reason: string;
  outpass_type: string;
  destination: string;
  hostel: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  is_exited: boolean;
  is_entered: boolean;
}

const STATUS_ORDER = {
  Approved: 1,
  Pending: 2,
  Rejected: 3,
};

function Guard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [outpasses, setOutpasses] = useState<OutpassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

  /* ================= FETCH (UNCHANGED) ================= */

  useEffect(() => {
    const fetchOutpasses = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/outpass/all-approved',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              role: 'guard',
            },
          }
        );

        if (!response.ok) throw new Error('Fetch failed');

        const data = await response.json();
        setOutpasses(data.outpasses);
      } catch (err) {
        console.error(err);
        alert('Failed to load outpasses');
      } finally {
        setLoading(false);
      }
    };

    fetchOutpasses();
  }, [token]);

  /* ================= FILTER + SORT (FRONTEND ONLY) ================= */

  const filteredOutpasses = useMemo(() => {
    return outpasses
      // ❌ already entered ko hata do
      .filter((p) => !p.is_entered)

      // 🔍 search
      .filter(
        (p) =>
          p.student_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          p.student_room
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )

      // ✅ status filter
      .filter(
        (p) =>
          statusFilter === 'All' ||
          p.status === statusFilter
      )

      // 🔃 status sort
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] -
          STATUS_ORDER[b.status]
      );
  }, [outpasses, searchQuery, statusFilter]);

  /* ================= ACTIONS ================= */

  const handleExit = async (id: number) => {
    if (!window.confirm('Record exit?')) return;

    await fetch(
      'http://localhost:5000/outpass/record-entry',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role: 'guard',
        },
        body: JSON.stringify({
          outpass_id: id,
          action: 'exit',
          gate: 'Main Gate',
        }),
      }
    );

    setOutpasses((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_exited: true } : p
      )
    );
  };

  const handleEntry = async (id: number) => {
    if (!window.confirm('Record entry?')) return;

    await fetch(
      'http://localhost:5000/outpass/record-entry',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          role: 'guard',
        },
        body: JSON.stringify({
          outpass_id: id,
          action: 'enter',
        }),
      }
    );

    setOutpasses((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_entered: true } : p
      )
    );
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Loading Outpasses...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-[#5b0e0e] text-white px-6 py-4 flex justify-between">
        <h1 className="text-2xl font-bold">Guard Dashboard</h1>
        <button
          onClick={logout}
          className="bg-white text-[#5b0e0e] px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>

      {/* FILTER BAR */}
      <div className="bg-white p-5 border-b">
        <div className="max-w-5xl mx-auto flex gap-4">
          <input
            type="text"
            placeholder="Search by name or room..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="flex-1 border rounded px-4 py-3"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as any
              )
            }
            className="border rounded px-4 py-3"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        {filteredOutpasses.length === 0 && (
          <div className="text-center text-gray-500">
            No records found
          </div>
        )}

        {filteredOutpasses.map((pass) => {
          const inside = !pass.is_exited;

          return (
            <div
              key={pass.id}
              className="bg-white border rounded-xl p-6 flex justify-between"
            >
              <div>
                <h2 className="font-bold text-xl">
                  {pass.student_name}
                </h2>
                <p className="text-gray-600">
                  {pass.student_room} • {pass.hostel}
                </p>

                <span
                  className={`text-sm font-semibold ${
                    pass.status === 'Approved'
                      ? 'text-green-600'
                      : pass.status === 'Pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {pass.status}
                </span>
              </div>

              <div className="flex gap-6 items-center">
                <input
                  type="checkbox"
                  checked={pass.is_exited}
                  disabled={
                    pass.status !== 'Approved' ||
                    pass.is_exited
                  }
                  onChange={() =>
                    handleExit(pass.id)
                  }
                />

                <input
                  type="checkbox"
                  checked={pass.is_entered}
                  disabled={
                    !pass.is_exited ||
                    pass.is_entered
                  }
                  onChange={() =>
                    handleEntry(pass.id)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Guard;