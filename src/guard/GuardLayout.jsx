import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function GuardLayout() {
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/signin";
  }

  return (
    <div className="h-screen w-screen flex bg-[#f8fafc] overflow-hidden font-sans text-gray-800 antialiased">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-[#6d0f16] via-[#580b11] to-[#3a060a] text-white flex flex-col shadow-2xl z-20 shrink-0 h-full">
        {/* LOGO HEADER */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <span>🛡️</span>
            <span>Guard Panel</span>
          </h1>
          <p className="text-xs text-white/70 mt-1 font-medium">
            Campus Gate Security System
          </p>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem to="/guard/dashboard" label="Gate Terminal" icon="🚪" />
          <NavItem to="/guard/logs" label="Movement Logs" icon="📋" />
        </nav>

        {/* FOOTER & LOGOUT */}
        <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
          <div className="bg-black/20 rounded-2xl p-3 text-xs flex items-center justify-between border border-white/5">
            <div>
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">
                Logged in as
              </p>
              <p className="font-bold text-white mt-0.5">Security Guard</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-white text-[#6d0f16] hover:bg-gray-100 font-semibold text-xs py-3 rounded-xl transition shadow-xs cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div>
            <h2 className="text-xl font-extrabold text-[#6d0f16] tracking-tight">
              Hostel Movement Verification
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Real-time student outpass tracking & logs
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 py-1.5 px-3.5 rounded-2xl">
            <div className="text-right">
              <p className="font-bold text-xs text-gray-800">Security Guard</p>
              <p className="text-[10px] font-semibold text-gray-500">
                Main Gate Desk
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#6d0f16] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              G
            </div>
          </div>
        </header>

        {/* ROUTE OUTLET */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-white text-[#6d0f16] shadow-md font-bold scale-[1.01]"
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}