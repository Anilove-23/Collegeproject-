import React from "react";

import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

export default function AdminLayout() {

  const location =
    useLocation();

  /* ================= LOGOUT ================= */

  function handleLogout() {

    localStorage.clear();

    window.location.href =
      "/signin";
  }

  /* ================= PAGE TITLE ================= */

  function getTitle() {

    if (
      location.pathname.includes(
        "/approved"
      )
    ) {

      return "Approved Outpasses";
    }

    if (
      location.pathname.includes(
        "/rejected"
      )
    ) {

      return "Rejected Outpasses";
    }

    if (
      location.pathname.includes(
        "/complaints"
      )
    ) {

      return "Hostel Complaints";
    }

    return "Pending Outpasses";
  }

  return (

    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-80 bg-gradient-to-b from-[#6d0f16] to-[#8b0f18] text-white flex flex-col shadow-2xl">

        {/* HEADER */}

        <div className="p-8 border-b border-white/10">

          <h1 className="text-4xl font-bold tracking-tight">

            Attendant Panel

          </h1>

          <p className="text-white/70 mt-2 text-sm leading-relaxed">

            Hostel Exit & Outpass Management System

          </p>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 p-5 space-y-3">

          <NavItem
            to="/attendant/pending"
            title="Pending Outpasses"
            icon="⏳"
          />

          <NavItem
            to="/attendant/approved"
            title="Approved Outpasses"
            icon="✅"
          />

          <NavItem
            to="/attendant/rejected"
            title="Rejected Outpasses"
            icon="❌"
          />

          <NavItem
            to="/attendant/complaints"
            title="Complaints"
            icon="🛠️"
          />

        </nav>

        {/* QUICK RULES */}

        <div className="p-5 space-y-4 border-t border-white/10">

          <div className="bg-white/10 rounded-2xl p-5 border border-white/10">

            <h3 className="font-semibold mb-3 text-lg">

              Quick Rules

            </h3>

            <ul className="space-y-2 text-sm text-white/80 list-disc pl-4 leading-relaxed">

              <li>
                Verify student details carefully
              </li>

              <li>
                Approve only genuine requests
              </li>

              <li>
                Home passes require strict validation
              </li>

              <li>
                Ensure hostel discipline is maintained
              </li>

            </ul>

          </div>

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="w-full bg-white text-[#6d0f16] font-semibold py-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow"
          >

            Logout

          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 overflow-y-auto p-8">

        {/* PAGE HEADER */}

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <h2 className="text-4xl font-bold text-[#6d0f16]">

              {getTitle()}

            </h2>

            <p className="text-gray-500 mt-2 text-lg">

              Manage hostel outpass requests efficiently.

            </p>

          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl px-6 py-5 min-w-[180px]">

            <p className="text-sm text-gray-500">

              Active Section

            </p>

            <p className="text-2xl font-bold text-[#6d0f16] mt-1">

              {getTitle()}

            </p>

          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 min-h-[80vh] overflow-hidden p-6">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({
  to,
  title,
  icon,
}) {

  return (

    <NavLink
      to={to}
      className={({ isActive }) =>

        `flex items-center gap-3 w-full px-5 py-4 rounded-2xl transition-all duration-200 font-medium text-lg
        ${
          isActive

            ? "bg-white text-[#6d0f16] shadow-lg"

            : "hover:bg-white/10 text-white"
        }`
      }
    >

      <span className="text-xl">

        {icon}

      </span>

      <span>

        {title}

      </span>

    </NavLink>
  );
}
