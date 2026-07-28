import React from "react";

export default function InstructionBox() {
  return (
    <div className="mb-6 bg-white border rounded-xl p-4">
      <h2 className="font-bold text-[#6d0f16] mb-2">
        Instructions
      </h2>
      <ul className="text-sm text-gray-600 list-disc ml-5">
        <li>Verify student identity before approval</li>
        <li>Reject with valid reason</li>
        <li>Check hostel rules strictly</li>
      </ul>
    </div>
  );
}