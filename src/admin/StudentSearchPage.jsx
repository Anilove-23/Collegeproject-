import React from "react";
import StudentDirectorySearch from "../room_management/components/shared/StudentDirectorySearch";

export default function StudentSearchPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Search</h1>
      <p className="text-gray-500 text-[14px] mb-6">
        Find a student's current hostel and room allocation.
      </p>
      <StudentDirectorySearch />
    </div>
  );
}
