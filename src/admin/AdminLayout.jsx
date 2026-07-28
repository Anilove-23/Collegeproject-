import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-72 bg-gradient-to-b from-[#5b0e0e] to-[#7a1414] text-white flex flex-col shadow-xl">

        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-xs text-white/70 mt-1">
            Hostel Management System
          </p>
        </div>

        <nav className="p-4 space-y-3">
          <SideLink to="/admin/students" label="Student Search" />
          <SideLink to="/room-management" label="Room Management" />
        </nav>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}

/* SIDEBAR LINK */
function SideLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-xl font-medium transition ${
          isActive
            ? "bg-white text-[#5b0e0e] shadow"
            : "hover:bg-white/10"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
