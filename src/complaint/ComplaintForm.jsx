import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

const COMPLAINT_TYPES = [
  { value: "cleaning", label: "Cleaning" },
  { value: "electricity", label: "Electricity" },
  { value: "plumbing", label: "Plumbing" },
  { value: "internet", label: "Internet/Wi-Fi" },
  { value: "other", label: "Other" }
];

const INITIAL_FORM = {
  title: "",
  description: "",
  type: "cleaning"
};

export default function ComplaintForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.title.trim()) {
      setError("Please enter a title");
      return false;
    }
    if (!form.description.trim()) {
      setError("Please provide a description");
      return false;
    }
    setError("");
    return true;
  }

  async function submit(e) {
    if (e) e.preventDefault();
    if (!validate()) return;

    let token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    const user = userStr ? JSON.parse(userStr) : {};

    try {
      setLoading(true);
      setError("");

      const responseData = await apiFetch('/complaint/postcomplaint', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          hostel: user.hostel
        }),
      });

      // error handling is managed by apiFetch

      setForm(INITIAL_FORM);
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
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
            Raise Complaint
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Report a hostel issue to the administration
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

        <form onSubmit={submit} className="space-y-6">
          {/* ================= TYPE ================= */}
          <div>
            <label htmlFor="complaint-type" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="complaint-type"
              className="w-full border rounded-2xl px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent bg-white"
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              disabled={loading}
            >
              {COMPLAINT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* ================= TITLE ================= */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="E.g., Broken fan in Room 204"
              className="mt-2 w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* ================= DESCRIPTION ================= */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Please provide details about the issue..."
              rows={5}
              className="mt-2 w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {/* ================= BUTTONS ================= */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-1/3 px-5 py-4 border border-gray-200 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 bg-[#6d0f16] hover:bg-[#5a0c12] active:bg-[#4a0a0f] text-white py-4 rounded-2xl font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6d0f16] focus:ring-offset-2"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}