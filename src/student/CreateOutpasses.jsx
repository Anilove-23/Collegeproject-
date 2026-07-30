import React, { useState } from "react";
import { apiFetch } from "../utils/api";

/* ================= CONSTANTS ================= */

const OUTPASS_TYPES = [
  { value: "local", label: "Local" },
  { value: "home", label: "Home" },
  { value: "outstation", label: "Outstation" },
];

const TYPES_REQUIRING_PLACE = ["home", "outstation"];

const INITIAL_FORM = {
  place: "",
  purpose: "",
  departure: "",
  arrival: "",
  parent_contact: "",
};

export default function CreateOutpass({ setActive, fetchOutpasses }) {
  const [type, setType] = useState("local");
  const [isEmergency, setIsEmergency] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requiresPlace = TYPES_REQUIRING_PLACE.includes(type);

  /* ================= HELPERS ================= */

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(newType) {
    setType(newType);
    setForm(INITIAL_FORM);
    setError("");
  }

  /* ================= VALIDATION ================= */

  function validate() {
    if (!form.purpose.trim()) {
      setError("Please enter purpose");
      return false;
    }

    if (requiresPlace && !form.place.trim()) {
      setError("Please fill Place of Visit");
      return false;
    }

    if (!form.departure || !form.arrival) {
      setError("Please fill all required fields");
      return false;
    }

    if (!form.parent_contact.trim()) {
      setError("Please fill all required fields");
      return false;
    }

    if (new Date(form.arrival) <= new Date(form.departure)) {
      setError("Arrival time must be after departure time");
      return false;
    }

    setError("");
    return true;
  }

  /* ================= SUBMIT ================= */

  async function submit() {
    if (!validate()) return;

    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/api/outpasses/create", {
        method: "POST",
        body: JSON.stringify({
          outpass_type: type,
          place_of_visit: requiresPlace ? form.place : "",
          purpose: form.purpose,
          departure_datetime: form.departure,
          arrival_datetime: form.arrival,
          parent_contact: form.parent_contact,
          is_emergency: isEmergency,
        }),
      });

      console.log(result);

      if (fetchOutpasses) {
        await fetchOutpasses();
      }

      setForm(INITIAL_FORM);
      setIsEmergency(false);
      setSubmitted(true);
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
        {/* ================= HEADER ================= */}

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#6d0f16]">
            Create Outpass
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Submit hostel leave request
          </p>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div
            role="alert"
            className="mb-5 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm"
          >
            {error}
          </div>
        )}

        {/* ================= TYPE ================= */}

        <div className="mb-5">
          <label
            htmlFor="outpass-type"
            className="text-sm font-medium text-gray-700"
          >
            Outpass Type
          </label>

          <select
            id="outpass-type"
            className="w-full border rounded-2xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {OUTPASS_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ================= EMERGENCY ================= */}

        <div className="mb-6 flex items-center gap-3 bg-gray-50 border rounded-2xl px-4 py-3">
          <input
            id="is-emergency"
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-[#6d0f16] focus:outline-none focus:ring-2 focus:ring-[#6d0f16] cursor-pointer"
          />
          <label
            htmlFor="is-emergency"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            This is an Emergency Outpass
          </label>
        </div>

        {/* ================= PURPOSE ================= */}

        <div className="mb-6">
          <Input
            id="purpose"
            label="Purpose"
            value={form.purpose}
            onChange={(v) => updateField("purpose", v)}
            placeholder="Enter reason for leave"
          />
        </div>

        {/* ================= PLACE OF VISIT ================= */}

        {requiresPlace && (
          <div className="mb-6">
            <Input
              id="place"
              label="Place of Visit"
              value={form.place}
              onChange={(v) => updateField("place", v)}
              placeholder="Enter city or location"
            />
          </div>
        )}

        {/* ================= CONTACT ================= */}

        <div className="mb-6">
          <Input
            id="parent-contact"
            label="Parent Contact"
            value={form.parent_contact}
            onChange={(v) => updateField("parent_contact", v)}
            placeholder="Enter parent phone number"
          />
        </div>

        {/* ================= DATETIME ================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="departure"
            label="Departure Time"
            type="datetime-local"
            value={form.departure}
            onChange={(v) => updateField("departure", v)}
          />

          <Input
            id="arrival"
            label="Arrival Time"
            type="datetime-local"
            value={form.arrival}
            onChange={(v) => updateField("arrival", v)}
          />
        </div>

        {/* ================= BUTTON ================= */}

        <button
          onClick={submit}
          disabled={loading}
          className="mt-8 w-full bg-[#6d0f16] hover:bg-[#5a0c12] active:bg-[#4a0a0f] text-white py-4 rounded-2xl font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
        >
          {loading ? "Submitting..." : "Submit Outpass"}
        </button>

        {/* ================= SUCCESS ================= */}

        {submitted && (
          <SuccessModal
            setSubmitted={setSubmitted}
            setActive={setActive}
          />
        )}
      </div>
    </div>
  );
}

/* ================= INPUT ================= */

function Input({ id, label, type = "text", value, onChange, placeholder = "" }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent"
      />
    </label>
  );
}

/* ================= SUCCESS MODAL ================= */

function SuccessModal({ setActive, setSubmitted }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-heading"
        className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-4xl sm:text-5xl mx-auto mb-5">
          ✓
        </div>

        <h3
          id="success-heading"
          className="font-bold text-xl sm:text-2xl text-[#6d0f16]"
        >
          Outpass Submitted
        </h3>

        <p className="text-sm text-gray-600 mt-3 mb-7 leading-relaxed">
          Your request has been submitted successfully and is waiting for
          approval.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setActive("my");
          }}
          className="bg-[#6d0f16] hover:bg-[#560c12] text-white px-6 py-3 rounded-2xl w-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
        >
          Go to My Outpasses
        </button>
      </div>
    </div>
  );
}