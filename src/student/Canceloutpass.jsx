import { useState } from "react";

import {
  apiFetch,
} from "../utils/api";

export default function CancelOutpass({
  outpasses,
  setOutpasses,
  setActive,
  fetchOutpasses,
}) {

  const [selectedOutpass, setSelectedOutpass] =
    useState(null);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [successId, setSuccessId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ================= ACTIVE ONLY ================= */

  const activeOutpasses =
    outpasses.filter((o) => {

      const status =
        o.outp_status?.toLowerCase();

      return (
        status === "pending" ||
        status === "approved"
      );
    });

  /* ================= CANCEL ================= */

  async function confirmCancel() {

    try {

      setLoading(true);

      setError("");

      const result =
        await apiFetch(
          `/api/outpasses/cancel/${selectedOutpass.id}`,
          {
            method: "PATCH",
          }
        );

      console.log(result);

      /* UPDATE */

      setOutpasses((prev) =>
        prev.map((o) =>
          o.id === selectedOutpass.id
            ? {
                ...o,
                outp_status:
                  "Rejected",
              }
            : o
        )
      );

      /* REFRESH */

      if (fetchOutpasses) {

        await fetchOutpasses();
      }

      setShowConfirm(false);

      setSelectedOutpass(null);

      setSuccessId(
        selectedOutpass.id
      );

      setTimeout(() => {

        setSuccessId(null);

        setActive("my");

      }, 1500);

    } catch (err) {

      console.log(err);

      setError(
        err.message
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="bg-white p-6 rounded-3xl border shadow-sm max-w-4xl mx-auto">

      {/* ================= HEADER ================= */}

      <div className="mb-6">

        <h2 className="font-bold text-3xl text-[#6d0f16]">

          Cancel Outpass

        </h2>

        <p className="text-gray-500 mt-1">

          Cancel active hostel outpasses safely

        </p>

      </div>

      {/* ================= ERROR ================= */}

      {error && (

        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 p-4 rounded-2xl">

          {error}

        </div>
      )}

      {/* ================= SUCCESS ================= */}

      {successId && (

        <div className="mb-4 bg-green-50 border border-green-300 text-green-700 p-4 rounded-2xl">

          ✅ Outpass
          {" "}
          <b>
            OP-{successId}
          </b>
          {" "}
          cancelled successfully

        </div>
      )}

      {/* ================= EMPTY ================= */}

      {activeOutpasses.length === 0 && (

        <div className="text-center text-gray-500 py-14 bg-gray-50 rounded-3xl border">

          No active outpasses available

        </div>
      )}

      {/* ================= LIST ================= */}

      <div className="space-y-4">

        {activeOutpasses.map((o) => (

          <div
            key={o.id}
            className="flex justify-between items-center border rounded-3xl p-5 hover:shadow-md transition bg-gray-50"
          >

            <div>

              <div className="flex items-center gap-3 flex-wrap">

                <p className="font-bold text-lg text-[#6d0f16]">

                  OP-{o.id}

                </p>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium
                  ${
                    o.outp_status
                      ?.toLowerCase() ===
                    "approved"

                      ? "bg-green-100 text-green-700"

                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >

                  {o.outp_status}

                </span>

              </div>

              <p className="text-sm text-gray-500 mt-2">

                {o.outpass_type}
                {" • "}
                {o.place_of_visit || "No Place"}
              </p>

            </div>

            <button
              onClick={() =>
                setSelectedOutpass(o)
              }
              className="bg-[#6d0f16] hover:bg-[#560c12] text-white px-5 py-2 rounded-xl transition text-sm"
            >

              View

            </button>

          </div>
        ))}

      </div>

      {/* ================= MODAL ================= */}

      {selectedOutpass && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-7 relative animate-in fade-in zoom-in duration-200">

            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedOutpass(null)
              }
              className="absolute top-5 right-5 text-gray-500 hover:text-black text-xl"
            >

              ✕

            </button>

            {/* TITLE */}

            <div className="mb-6">

              <h3 className="text-2xl font-bold text-[#6d0f16]">

                Outpass Details

              </h3>

              <p className="text-gray-500 text-sm mt-1">

                Review details before cancellation

              </p>

            </div>

            {/* STATUS */}

            <div className="mb-6">

              <span
                className={`px-4 py-2 text-xs rounded-full font-semibold
                ${
                  selectedOutpass.outp_status
                    ?.toLowerCase() ===
                  "approved"

                    ? "bg-green-100 text-green-700"

                    : "bg-yellow-100 text-yellow-700"
                }`}
              >

                {selectedOutpass.outp_status}

              </span>

            </div>

            {/* DETAILS */}

            <div className="grid md:grid-cols-2 gap-4 text-sm">

              <Detail
                label="Outpass ID"
                value={`OP-${selectedOutpass.id}`}
              />

              <Detail
                label="Type"
                value={
                  selectedOutpass.outpass_type
                }
              />

              <Detail
                label="Place"
                value={
                  selectedOutpass.place_of_visit
                }
              />

              <Detail
                label="Purpose"
                value={
                  selectedOutpass.purpose
                }
              />

              <Detail
                label="Departure"
                value={
                  selectedOutpass.departure_datetime
                    ? new Date(
                        selectedOutpass.departure_datetime
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "N/A"
                }
              />

              <Detail
                label="Arrival"
                value={
                  selectedOutpass.arrival_datetime
                    ? new Date(
                        selectedOutpass.arrival_datetime
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "N/A"
                }
              />

            </div>

            {/* ACTIONS */}

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={() =>
                  setSelectedOutpass(null)
                }
                className="px-5 py-3 border rounded-2xl hover:bg-gray-100 transition"
              >

                Close

              </button>

              <button
                onClick={() =>
                  setShowConfirm(true)
                }
                disabled={loading}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl disabled:bg-gray-300 transition"
              >

                {loading
                  ? "Cancelling..."
                  : "Cancel Outpass"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= CONFIRM ================= */}

      {showConfirm && (

        <ConfirmModal
          loading={loading}
          onCancel={() =>
            setShowConfirm(false)
          }
          onConfirm={confirmCancel}
        />
      )}

    </div>
  );
}

/* ================= CONFIRM MODAL ================= */

function ConfirmModal({
  onCancel,
  onConfirm,
  loading,
}) {

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-md p-7 rounded-3xl shadow-2xl text-center">

        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-5">

          ⚠️

        </div>

        <h3 className="font-bold text-2xl text-[#6d0f16] mb-3">

          Confirm Cancellation

        </h3>

        <p className="text-sm text-gray-600 mb-7 leading-relaxed">

          Are you sure you want to cancel this outpass?
          This action cannot be undone.

        </p>

        <div className="flex justify-center gap-3">

          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-3 border rounded-2xl hover:bg-gray-100 transition"
          >

            No

          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition"
          >

            {loading
              ? "Cancelling..."
              : "Yes Cancel"}

          </button>

        </div>

      </div>

    </div>
  );
}

/* ================= DETAIL ================= */

function Detail({
  label,
  value,
}) {

  return (

    <div className="bg-gray-50 border rounded-2xl p-4">

      <p className="text-xs text-gray-500 mb-1">

        {label}

      </p>

      <p className="font-semibold text-sm text-gray-800 break-words">

        {value || "N/A"}

      </p>

    </div>
  );
}