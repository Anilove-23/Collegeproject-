import { useState } from "react";

import { apiFetch } from "../utils/api";

export default function CancelOutpass({
  outpasses,
  setOutpasses,
  setActive,
  fetchOutpasses,
}) {
  const [selectedOutpass, setSelectedOutpass] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= ACTIVE ONLY ================= */

  const activeOutpasses = outpasses.filter((o) => {
  const status = o.outp_status?.toLowerCase();

  return (
    o.is_active === true &&
    (status === "pending" || status === "approved")
  );
});

  /* ================= CANCEL ================= */

  async function confirmCancel() {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch(
        `/api/outpasses/cancel/${selectedOutpass.id}`,
        {
          method: "PATCH",
        }
      );

      // console.log(result);

      /* UPDATE */

      setOutpasses((prev) =>
        prev.map((o) =>
          o.id === selectedOutpass.id
            ? { ...o, outp_status: "Rejected" }
            : o
        )
      );

      /* REFRESH */

      if (fetchOutpasses) {
        await fetchOutpasses();
      }

      setShowConfirm(false);
      setSelectedOutpass(null);
      setSuccessId(selectedOutpass.id);

      setTimeout(() => {
        setSuccessId(null);
        setActive("my");
      }, 1500);
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm max-w-[1000px] mx-auto">
      {/* ================= HEADER ================= */}

      <div className="mb-6 sm:mb-8 flex items-start gap-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#6d0f16]/10 text-[#6d0f16] flex items-center justify-center text-xl sm:text-2xl shrink-0">
          🎫
        </div>
        <div>
          <h2 className="font-bold text-2xl sm:text-3xl text-[#6d0f16]">
            Cancel Outpass
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Review and cancel your active hostel outpasses.
          </p>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          role="alert"
          className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3"
        >
          <span className="text-lg shrink-0" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ================= SUCCESS ================= */}

      {successId && (
        <div
          role="status"
          className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200"
        >
          <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-base shrink-0">
            ✅
          </span>
          <p className="text-sm font-semibold">
            Outpass <span className="font-bold">OP-{successId}</span>{" "}
            cancelled successfully
          </p>
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {activeOutpasses.length === 0 && (
        <div className="text-center py-14 sm:py-16 px-4 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
          <div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">
            📭
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-gray-700">
            No Active Outpasses
          </h3>
          <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
            You currently have no pending or approved outpasses.
          </p>
          <button
            onClick={() => setActive("my")}
            className="mt-6 bg-[#6d0f16] hover:bg-[#560c12] active:bg-[#4a0a0f] text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* ================= LIST ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeOutpasses.map((o) => (
          <OutpassCard
            key={o.id}
            outpass={o}
            onView={() => setSelectedOutpass(o)}
          />
        ))}
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}

      {selectedOutpass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* STICKY HEADER */}

            <div className="sticky top-0 bg-white z-10 flex items-start justify-between px-5 sm:px-7 pt-5 sm:pt-7 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#6d0f16]">
                  Outpass Details
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Review details before cancellation
                </p>
              </div>

              <button
                onClick={() => setSelectedOutpass(null)}
                aria-label="Close details"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center text-sm transition shrink-0 focus:outline-none focus:ring-2 focus:ring-[#6d0f16]"
              >
                ✕
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}

            <div className="p-5 sm:p-7 overflow-y-auto">
              {/* STATUS */}

              <div className="mb-6">
                <StatusBadge status={selectedOutpass.outp_status} large />
              </div>

              {/* DETAILS */}

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Detail label="Outpass ID" value={`OP-${selectedOutpass.id}`} />
                <Detail label="Type" value={selectedOutpass.outpass_type} />
                <Detail label="Place" value={selectedOutpass.place_of_visit} />
                <Detail label="Purpose" value={selectedOutpass.purpose} />
                <Detail
                  label="Departure"
                  value={
                    selectedOutpass.departure_datetime
                      ? new Date(
                          selectedOutpass.departure_datetime
                        ).toLocaleString("en-IN")
                      : "N/A"
                  }
                />
                <Detail
                  label="Arrival"
                  value={
                    selectedOutpass.arrival_datetime
                      ? new Date(
                          selectedOutpass.arrival_datetime
                        ).toLocaleString("en-IN")
                      : "N/A"
                  }
                />
              </div>

              {/* ACTIONS */}

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setSelectedOutpass(null)}
                  className="px-5 py-3 border border-gray-200 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
                >
                  Close
                </button>

                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {loading ? "Cancelling..." : "Cancel Outpass"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM ================= */}

      {showConfirm && (
        <ConfirmModal
          loading={loading}
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}

/* ================= OUTPASS CARD ================= */

function OutpassCard({ outpass, onView }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 rounded-2xl p-5 bg-gray-50 hover:shadow-md hover:bg-white transition-all duration-200">
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-bold text-lg text-[#6d0f16]">OP-{outpass.id}</p>
          <StatusBadge status={outpass.outp_status} />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {outpass.outpass_type} • {outpass.place_of_visit || "No Place"}
        </p>

        <p className="text-xs text-gray-400 mt-1.5">
          {outpass.departure_datetime
            ? new Date(outpass.departure_datetime).toLocaleString("en-IN")
            : "N/A"}{" "}
          →{" "}
          {outpass.arrival_datetime
            ? new Date(outpass.arrival_datetime).toLocaleString("en-IN")
            : "N/A"}
        </p>
      </div>

      <button
        onClick={onView}
        className="bg-[#6d0f16] hover:bg-[#560c12] active:bg-[#4a0a0f] text-white px-5 py-2.5 rounded-xl transition-colors duration-150 text-sm font-medium self-start sm:self-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
      >
        View
      </button>
    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status, large = false }) {
  const isApproved = status?.toLowerCase() === "approved";
  const sizing = large ? "px-4 py-2 text-xs" : "px-3 py-1 text-xs";

  return (
    <span
      className={`${sizing} rounded-full font-semibold inline-block ${
        isApproved
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

/* ================= CONFIRM MODAL ================= */

function ConfirmModal({ onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-5">
          ⚠️
        </div>

        <h3 className="font-bold text-xl sm:text-2xl text-[#6d0f16] mb-3">
          Confirm Cancellation
        </h3>

        <p className="text-sm text-gray-600 mb-7 leading-relaxed">
          Are you sure you want to cancel this outpass?
          <br />
          This action cannot be undone.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-3 border border-gray-200 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
          >
            Keep Outpass
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl transition-colors duration-150 font-medium disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= DETAIL ================= */

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4">
      <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
      <p className="font-semibold text-sm text-gray-800 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}