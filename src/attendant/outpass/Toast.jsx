import React, { useEffect } from "react";

export default function Toast({
  toast,
  onClose,
  duration = 3500,
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const success = toast.type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm transition-all ${
        success
          ? "bg-green-600"
          : "bg-red-600"
      }`}
    >
      {toast.message}
    </div>
  );
}