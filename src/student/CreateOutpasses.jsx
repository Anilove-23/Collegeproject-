import React, {
  useState,
} from "react";

import {
  apiFetch,
} from "../utils/api";

export default function CreateOutpass({
  setActive,
  fetchOutpasses,
}) {

  const [type, setType] =
    useState("local");

  const [form, setForm] =
    useState({
      place: "",
      purpose: "",
      departure: "",
      arrival: "",
      parent_contact: "",
    });

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* ================= VALIDATION ================= */

  function validate() {

    if (
      !form.departure ||
      !form.arrival ||
      !form.parent_contact
    ) {

      setError(
        "Please fill all required fields"
      );

      return false;
    }

    /* PURPOSE REQUIRED */

    if (!form.purpose) {

      setError(
        "Please enter purpose"
      );

      return false;
    }

    /* OUTSTATION PLACE */

    if (
      type === "outstation" &&
      !form.place
    ) {

      setError(
        "Please fill Place of Visit"
      );

      return false;
    }

    /* DATE VALIDATION */

    if (
      new Date(
        form.arrival
      ) <=
      new Date(
        form.departure
      )
    ) {

      setError(
        "Arrival time must be after departure time"
      );

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

      const result =
        await apiFetch(
          "/api/outpasses/create",
          {
            method: "POST",

            body: JSON.stringify({

              outpass_type:
                type,

              place_of_visit:
                type ===
                "outstation"

                  ? form.place

                  : "Local Area",

              purpose:
                form.purpose,

              departure_datetime:
                form.departure,

              arrival_datetime:
                form.arrival,

              parent_contact:
                form.parent_contact,
            }),
          }
        );

      console.log(result);

      /* REFRESH */

      if (fetchOutpasses) {

        await fetchOutpasses();
      }

      /* RESET */

      setForm({
        place: "",
        purpose: "",
        departure: "",
        arrival: "",
        parent_contact: "",
      });

      setSubmitted(true);

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

    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-3xl bg-white p-8 rounded-3xl border shadow-sm">

        {/* ================= HEADER ================= */}

        <div className="text-center mb-8">

          <h2 className="text-4xl font-bold text-[#6d0f16]">

            Create Outpass

          </h2>

          <p className="text-gray-500 mt-2">

            Submit hostel leave request

          </p>

        </div>

        {/* ================= ERROR ================= */}

        {error && (

          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">

            {error}

          </div>
        )}

        {/* ================= TYPE ================= */}

        <div className="mb-6">

          <label className="text-sm font-medium text-gray-700">

            Outpass Type

          </label>

          <select
            className="w-full border rounded-2xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#6d0f16]"
            value={type}
            onChange={(e) => {

              setType(
                e.target.value
              );

              setForm({
                place: "",
                purpose: "",
                departure: "",
                arrival: "",
                parent_contact: "",
              });

              setError("");
            }}
          >

            <option value="local">

              Local

            </option>

            <option value="outstation">

              Outstation

            </option>

          </select>

        </div>

        {/* ================= PURPOSE ================= */}

        <div className="mb-6">

          <Input
            label="Purpose"
            value={form.purpose}
            onChange={(v) =>
              setForm({
                ...form,
                purpose: v,
              })
            }
            placeholder="Enter reason for leave"
          />

        </div>

        {/* ================= OUTSTATION ================= */}

        {type === "outstation" && (

          <div className="mb-6">

            <Input
              label="Place of Visit"
              value={form.place}
              onChange={(v) =>
                setForm({
                  ...form,
                  place: v,
                })
              }
              placeholder="Enter city or location"
            />

          </div>
        )}

        {/* ================= CONTACT ================= */}

        <div className="mb-6">

          <Input
            label="Parent Contact"
            value={form.parent_contact}
            onChange={(v) =>
              setForm({
                ...form,
                parent_contact: v,
              })
            }
            placeholder="Enter parent phone number"
          />

        </div>

        {/* ================= DATETIME ================= */}

        <div className="grid md:grid-cols-2 gap-5">

          <Input
            label="Departure Time"
            type="datetime-local"
            value={form.departure}
            onChange={(v) =>
              setForm({
                ...form,
                departure: v,
              })
            }
          />

          <Input
            label="Arrival Time"
            type="datetime-local"
            value={form.arrival}
            onChange={(v) =>
              setForm({
                ...form,
                arrival: v,
              })
            }
          />

        </div>

        {/* ================= BUTTON ================= */}

        <button
          onClick={submit}
          disabled={loading}
          className="mt-8 w-full bg-[#6d0f16] hover:bg-[#5a0c12] text-white py-4 rounded-2xl font-semibold transition disabled:opacity-50"
        >

          {loading

            ? "Submitting..."

            : "Submit Outpass"}

        </button>

        {/* ================= SUCCESS ================= */}

        {submitted && (

          <Success
            setSubmitted={
              setSubmitted
            }
            setActive={
              setActive
            }
          />
        )}

      </div>

    </div>
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
}) {

  return (

    <label className="block">

      <span className="text-sm font-medium text-gray-700">

        {label}

      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="mt-2 w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6d0f16]"
      />

    </label>
  );
}

/* ================= SUCCESS ================= */

function Success({
  setActive,
  setSubmitted,
}) {

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

      <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">

        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-5xl mx-auto mb-5">

          ✓

        </div>

        <h3 className="font-bold text-2xl text-[#6d0f16]">

          Outpass Submitted

        </h3>

        <p className="text-sm text-gray-600 mt-3 mb-7 leading-relaxed">

          Your request has been submitted successfully
          and is waiting for approval.

        </p>

        <button
          onClick={() => {

            setSubmitted(false);

            setActive("my");
          }}
          className="bg-[#6d0f16] hover:bg-[#560c12] text-white px-6 py-3 rounded-2xl w-full transition"
        >

          Go to My Outpasses

        </button>

      </div>

    </div>
  );
}