import React from "react";
import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Admin Panel</h1>
      <p className="text-gray-500 text-[14px] mb-6">
        Manage hostels, rooms, and residents from here.
      </p>
      <Link
        to="/room-management"
        className="inline-block bg-[#5b0e0e] hover:bg-[#741616] text-white font-bold px-6 py-3 rounded-xl transition"
      >
        Go to Room Management
      </Link>
    </div>
  );
}
