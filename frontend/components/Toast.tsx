"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-purple-600",
  };

  return (
    <div className={`fixed top-20 right-4 z-50 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
    </div>
  );
}