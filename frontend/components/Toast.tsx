"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "border-green-500/30 text-green-400",
    error: "border-red-500/30 text-red-400",
    info: "border-purple-500/30 text-purple-300",
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 bg-gray-900 border rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 animate-fade-in transition-all ${styles[type]}`}
    >
      {/* Message */}
      <span className="text-sm font-medium">{message}</span>

      {/* Close */}
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-white transition"
      >
        ✕
      </button>
    </div>
  );
}