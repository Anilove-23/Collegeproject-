import React from "react";

export default function InstructionBox({
  role = "attendant",
}) {

  /* ================= ROLE RULES ================= */

  const instructions = {

    attendant: [
      "Verify student identity before approval",
      "Check departure and arrival timings carefully",
      "Reject invalid or suspicious requests",
      "Ensure hostel rules are followed strictly",
    ],

    guard: [
      "Verify approved outpass before allowing exit",
      "Record student entry and exit properly",
      "Report late returns immediately",
      "Do not allow unauthorized movement",
    ],

    student: [
      "Return before the approved arrival time",
      "Carry hostel ID card while outside",
      "Multiple violations may lead to restrictions",
      "Use genuine reasons while applying",
    ],
  };

  const currentInstructions =
    instructions[role] ||
    instructions.student;

  /* ================= COLORS ================= */

  const roleStyles = {

    attendant:
      "border-[#6d0f16]/20 bg-[#fff7f7] text-[#6d0f16]",

    guard:
      "border-blue-200 bg-blue-50 text-blue-700",

    student:
      "border-green-200 bg-green-50 text-green-700",
  };

  /* ================= ICONS ================= */

  const roleIcons = {

    attendant: "🛡️",

    guard: "🚪",

    student: "🎓",
  };

  return (

    <div
      className={`mb-6 border rounded-3xl p-6 shadow-sm transition hover:shadow-md ${roleStyles[role]}`}
    >

      {/* ================= HEADER ================= */}

      <div className="flex items-center gap-3 mb-5">

        <div className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center text-2xl shadow-sm">

          {roleIcons[role]}

        </div>

        <div>

          <h2 className="font-bold text-lg">

            Instructions

          </h2>

          <p className="text-xs opacity-75 mt-1">

            Follow hostel management guidelines carefully

          </p>

        </div>

      </div>

      {/* ================= LIST ================= */}

      <ul className="space-y-3 text-sm list-disc ml-5 leading-relaxed">

        {currentInstructions.map(
          (item, index) => (

            <li
              key={index}
              className="break-words"
            >

              {item}

            </li>
          )
        )}

      </ul>

    </div>
  );
}