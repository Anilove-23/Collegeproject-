import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

export default function AdminLayout() {

  const location =
    useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const sidebarRef = useRef(null);

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

  /* ================= CLOSE ON ROUTE CHANGE ================= */

  useEffect(() => {

    setSidebarOpen(false);

  }, [location.pathname]);

  /* ================= ESC KEY CLOSES DRAWER ================= */

  useEffect(() => {

    function handleKeyDown(e) {

      if (e.key === "Escape") {

        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {

      document.addEventListener(
        "keydown",
        handleKeyDown
      );
    }

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [sidebarOpen]);

  /* ================= LOCK BODY SCROLL WHILE DRAWER OPEN ================= */

  useEffect(() => {

    const original =
      document.body.style.overflow;

    if (sidebarOpen) {

      document.body.style.overflow =
        "hidden";
    }

    return () => {

      document.body.style.overflow =
        original;
    };

  }, [sidebarOpen]);

  /* ================= BASIC FOCUS TRAP ================= */

  useEffect(() => {

    if (!sidebarOpen) return;

    const node = sidebarRef.current;

    if (!node) return;

    const focusable = node.querySelectorAll(
      'a[href], button:not([disabled])'
    );

    if (focusable.length > 0) {

      focusable[0].focus();
    }

    function handleTab(e) {

      if (e.key !== "Tab") return;

      const first = focusable[0];
      const last =
        focusable[focusable.length - 1];

      if (e.shiftKey) {

        if (document.activeElement === first) {

          e.preventDefault();
          last.focus();
        }
      } else {

        if (document.activeElement === last) {

          e.preventDefault();
          first.focus();
        }
      }
    }

    node.addEventListener(
      "keydown",
      handleTab
    );

    return () => {

      node.removeEventListener(
        "keydown",
        handleTab
      );
    };

  }, [sidebarOpen]);

  return (

    <div className="h-screen flex flex-col lg:flex-row bg-gray-100 overflow-hidden">

      {/* ================= MOBILE TOP BAR ================= */}

      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-sm flex items-center justify-between px-4 py-3">

        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 text-2xl text-[#6d0f16]"
        >

          ☰

        </button>

        <h1 className="text-lg font-bold text-[#6d0f16]">

          Attendant Panel

        </h1>

        <button
          onClick={handleLogout}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 text-sm font-semibold text-[#6d0f16]"
        >

          Logout

        </button>

      </div>

      {/* ================= MOBILE BACKDROP ================= */}

      {sidebarOpen && (

        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />

      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        ref={sidebarRef}
        className={`
          fixed lg:static top-0 left-0 h-full z-50
          w-[80%] max-w-xs lg:w-80
          bg-gradient-to-b from-[#6d0f16] to-[#8b0f18] text-white
          flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >

        {/* HEADER */}

        <div className="p-5 sm:p-6 lg:p-8 border-b border-white/10 flex items-start justify-between">

          <div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">

              Attendant Panel

            </h1>

            <p className="text-white/70 mt-2 text-xs sm:text-sm leading-relaxed">

              Hostel Exit & Outpass Management System

            </p>

          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-xl"
          >

            ✕

          </button>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 p-5 space-y-3 overflow-y-auto">

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
            className="w-full min-h-[44px] bg-white text-[#6d0f16] font-semibold py-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow"
          >

            Logout

          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">

        {/* PAGE HEADER */}

        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6d0f16]">

              {getTitle()}

            </h2>

            <p className="text-gray-500 mt-2 text-base lg:text-lg">

              Manage hostel outpass requests efficiently.

            </p>

          </div>

          <div className="w-full lg:w-auto bg-white border border-gray-200 shadow-sm rounded-3xl px-6 py-5 lg:min-w-[180px]">

            <p className="text-sm text-gray-500">

              Active Section

            </p>

            <p className="text-2xl font-bold text-[#6d0f16] mt-1">

              {getTitle()}

            </p>

          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 min-h-[80vh] overflow-hidden p-4 sm:p-6">

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

        `flex items-center gap-3 w-full min-h-[44px] px-4 py-3 lg:px-5 lg:py-4 rounded-2xl transition-all duration-200 font-medium text-base lg:text-lg
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