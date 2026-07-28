import React from "react";
import DetailCard from "./DetailCard";

export default function OutpassModal({ outpass, onClose }) {

  function printPDF() {
    const w = window.open("", "_blank");

    w.document.write(`
      <html>
        <body onload="window.print();window.close()">
          <h2>Outpass ${outpass.id}</h2>
          <p>Name: ${outpass.student_name}</p>
          <p>Room: ${outpass.room}</p>
          <p>Status: ${outpass.status}</p>
        </body>
      </html>
    `);

    w.document.close();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white w-[500px] p-6 rounded-xl">

        <h2 className="font-bold text-[#6d0f16] mb-4">
          Outpass Details
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <DetailCard label="Name" value={outpass.student_name} />
          <DetailCard label="Room" value={outpass.room} />
          <DetailCard label="Type" value={outpass.type} />
          <DetailCard label="Place" value={outpass.place} />
          <DetailCard label="Status" value={outpass.status} />
        </div>

        <div className="mt-5 flex justify-end gap-2">

          <button onClick={onClose} className="px-3 py-2 border rounded">
            Close
          </button>

          <button
            onClick={printPDF}
            className="px-3 py-2 bg-[#6d0f16] text-white rounded"
          >
            PDF
          </button>

        </div>

      </div>

    </div>
  );
}