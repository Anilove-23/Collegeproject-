import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function GuardLayout() {
  /* ================= LOGOUT ================= */
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/signin";
  }

  return (
    <div className="h-screen w-screen flex bg-[#f8fafc] overflow-hidden font-sans text-gray-800 antialiased">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-gradient-to-b from-[#6d0f16] via-[#580b11] to-[#3a060a] text-white flex flex-col shadow-2xl z-20 shrink-0 h-full">
        {/* TOP HEADER */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <span>🛡️</span>
            <span>Guard Panel</span>
          </h1>
          <p className="text-xs text-white/70 mt-1 leading-relaxed font-medium">
            Hostel Exit & Return Management
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem
            to="/guard/dashboard"
            label="Dashboard"
            icon="📊"
          />
          <NavItem
            to="/guard/exit"
            label="Exit Students"
            icon="🚪"
          />
          <NavItem
            to="/guard/return"
            label="Return Students"
            icon="🔄"
          />
        </nav>

        {/* FOOTER & INSTRUCTIONS */}
        <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
          {/* INSTRUCTIONS */}
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white/90 flex items-center gap-1.5">
              <span>📌</span> Guard Checklist
            </h3>
            <ul className="mt-2 text-[11px] text-white/80 space-y-1 leading-tight font-medium">
              <li>• Verify approved outpass before exit</li>
              <li>• Confirm student photo ID carefully</li>
              <li>• Record return timings accurately</li>
              <li>• Ensure gate safety protocols</li>
            </ul>
          </div>

          {/* GUARD USER INFO */}
          <div className="bg-black/20 rounded-2xl p-3 text-xs flex items-center justify-between border border-white/5">
            <div>
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">
                Logged in as
              </p>
              <p className="font-bold text-white mt-0.5">Security Guard</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full bg-white text-[#6d0f16] hover:bg-gray-100 font-semibold text-xs py-3 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-[#6d0f16] tracking-tight">
              Hostel Security Management
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Monitor student movement and outpass verification
            </p>
          </div>

          {/* GUARD PROFILE BADGE */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 py-1.5 px-3.5 rounded-2xl">
            <div className="text-right">
              <p className="font-bold text-xs text-gray-800">Security Guard</p>
              <p className="text-[10px] font-semibold text-gray-500">
                Gate Monitoring
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#6d0f16] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              G
            </div>
          </div>
        </header>

        {/* PAGE CONTENT WRAPPER */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= NAV ITEM COMPONENT ================= */
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