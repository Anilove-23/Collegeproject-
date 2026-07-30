import { useEffect, useState } from "react";

export default function RemarkDialog({
  open,
  action,
  loading = false,
  onCancel,
  onSubmit,
}) {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (open) setRemark("");
  }, [open]);

  if (!open) return null;

  const isReject = action === "reject";

  const handleSubmit = () => {
    if (isReject && remark.trim() === "") {
      alert("Remark is required.");
      return;
    }

    onSubmit(remark.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold">
            {isReject ? "Reject Outpass" : "Approve Outpass"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {isReject
              ? "Please provide a reason for rejection."
              : "Add a remark (optional)."}
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium mb-2">
            Remark {isReject && <span className="text-red-500">*</span>}
          </label>

          <textarea
            rows={5}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={
              isReject
                ? "Enter rejection reason..."
                : "Optional remark..."
            }
            className="w-full border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6d0f16]"
          />
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-white ${
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-50`}
          >
            {loading
              ? "Processing..."
              : isReject
              ? "Reject"
              : "Approve"}
          </button>

        </div>
      </div>
    </div>
  );
}