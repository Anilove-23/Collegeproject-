import React from "react";

import DetailCard from "./DetailCard";

export default function OutpassModal({
  outpass,
  onClose,
}) {

  /* ================= FORMAT DATE ================= */

  function formatDate(date) {

    if (!date) return "-";

    return new Date(date)
      .toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
  }

  /* ================= PRINT ================= */

  function printPDF() {

    const w =
      window.open(
        "",
        "_blank"
      );

    w.document.write(`
      <html>

        <head>

          <title>
            Outpass ${outpass.id}
          </title>

          <style>

            body {
              font-family: Arial;
              padding: 35px;
              color: #222;
              background: #fff;
            }

            h1 {
              color: #6d0f16;
              margin-bottom: 10px;
            }

            .subtitle {
              color: #666;
              margin-bottom: 30px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
            }

            .card {
              border: 1px solid #ddd;
              border-radius: 14px;
              padding: 16px;
              background: #fafafa;
            }

            .label {
              font-size: 12px;
              color: gray;
              margin-bottom: 8px;
              text-transform: uppercase;
            }

            .value {
              font-size: 16px;
              font-weight: bold;
              word-break: break-word;
            }

            .status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              background: #dcfce7;
              color: #15803d;
              font-size: 12px;
              font-weight: bold;
            }

          </style>

        </head>

        <body onload="window.print();window.close()">

          <h1>
            Hostel Outpass
          </h1>

          <div class="subtitle">
            Outpass ID:
            OP-${String(
              outpass.id
            ).padStart(4, "0")}
          </div>

          <div class="grid">

            <div class="card">
              <div class="label">
                Student Name
              </div>

              <div class="value">
                ${outpass.name || outpass.student_name || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Roll Number
              </div>

              <div class="value">
                ${outpass.roll_no || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Department
              </div>

              <div class="value">
                ${outpass.department || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Hostel / Room
              </div>

              <div class="value">
                ${outpass.hostel || "-"} /
                ${outpass.room || outpass.room_no || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Outpass Type
              </div>

              <div class="value">
                ${outpass.outpass_type || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Place of Visit
              </div>

              <div class="value">
                ${outpass.place_of_visit || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Purpose
              </div>

              <div class="value">
                ${outpass.purpose || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Parent Contact
              </div>

              <div class="value">
                ${outpass.parent_contact || "-"}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Departure Time
              </div>

              <div class="value">
                ${formatDate(
                  outpass.departure_datetime
                )}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Arrival Time
              </div>

              <div class="value">
                ${formatDate(
                  outpass.arrival_datetime
                )}
              </div>
            </div>

            <div class="card">
              <div class="label">
                Status
              </div>

              <div class="status">
                ${outpass.outp_status || "-"}
              </div>
            </div>

          </div>

        </body>

      </html>
    `);

    w.document.close();
  }

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between px-7 py-6 border-b bg-gradient-to-r from-[#6d0f16] to-[#8b0f18] text-white">

          <div>

            <h2 className="text-3xl font-bold">

              Outpass Details

            </h2>

            <p className="text-sm text-white/70 mt-2">

              OP-
              {String(
                outpass.id
              ).padStart(4, "0")}

            </p>

          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl transition"
          >

            ✕

          </button>

        </div>

        {/* ================= BODY ================= */}

        <div className="p-7 max-h-[75vh] overflow-y-auto">

          {/* TOP STUDENT INFO */}

          <div className="bg-gray-50 border rounded-3xl p-6 mb-7">

            <div className="flex flex-wrap items-center gap-4">

              <div className="w-16 h-16 rounded-full bg-[#6d0f16] text-white flex items-center justify-center text-2xl font-bold">

                {(outpass.name || "S")
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <h2 className="text-2xl font-bold text-gray-800">

                  {outpass.name ||
                    outpass.student_name ||
                    "-"}

                </h2>

                <p className="text-gray-500 mt-1">

                  {outpass.roll_no || "No Roll No"}
                  {" • "}
                  {outpass.department || "-"}

                </p>

              </div>

            </div>

          </div>

          {/* DETAIL GRID */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            <DetailCard
              label="Student Name"
              value={
                outpass.name ||
                outpass.student_name
              }
            />

            <DetailCard
              label="Roll Number"
              value={
                outpass.roll_no
              }
            />

            <DetailCard
              label="Department"
              value={
                outpass.department
              }
            />

            <DetailCard
              label="Hostel"
              value={
                outpass.hostel
              }
            />

            <DetailCard
              label="Room"
              value={
                outpass.room_no ||
                outpass.room
              }
            />

            <DetailCard
              label="Phone"
              value={
                outpass.phone
              }
            />

            <DetailCard
              label="Email"
              value={
                outpass.email
              }
            />

            <DetailCard
              label="Type"
              value={
                outpass.outpass_type
              }
              field="type"
              type={
                outpass.outpass_type
              }
            />

            <DetailCard
              label="Place"
              value={
                outpass.place_of_visit
              }
              type={
                outpass.outpass_type
              }
              field="place"
            />

            <DetailCard
              label="Purpose"
              value={
                outpass.purpose
              }
              field="purpose"
            />

            <DetailCard
              label="Departure"
              value={
                outpass.departure_datetime
              }
              field="departure"
            />

            <DetailCard
              label="Arrival"
              value={
                outpass.arrival_datetime
              }
              field="arrival"
            />

            <DetailCard
              label="Parent Contact"
              value={
                outpass.parent_contact
              }
            />

            <DetailCard
              label="Status"
              value={
                outpass.outp_status
              }
              field="status"
            />

          </div>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="border-t px-7 py-5 flex justify-end gap-4 bg-gray-50">

          <button
            onClick={onClose}
            className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition font-medium"
          >

            Close

          </button>

          <button
            onClick={printPDF}
            className="px-6 py-3 bg-[#6d0f16] hover:bg-[#560c12] text-white rounded-2xl transition font-medium shadow-sm"
          >

            Print / PDF

          </button>

        </div>

      </div>

    </div>
  );
}