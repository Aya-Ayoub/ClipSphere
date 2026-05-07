"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: "like" | "tip" | "follow";
  title: string;
  body: string;
}

interface NotificationBubbleProps {
  notification: Notification | null;
  onDismiss: () => void;
}

export default function NotificationBubble({ notification, onDismiss }: NotificationBubbleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification?.id]);

  if (!notification) return null;

  const accentColor: Record<string, string> = {
    like:   "border-purple-500/30",
    tip:    "border-green-500/30",
    follow: "border-blue-500/30",
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed top-20 right-4 z-[999] w-72
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
    >
      <div className={`bg-gray-900 border ${accentColor[notification.type] || "border-gray-700"} rounded-xl px-4 py-3 shadow-lg flex items-start gap-3`}>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">{notification.title}</p>
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{notification.body}</p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          aria-label="Dismiss"
          className="text-gray-500 hover:text-white transition text-xs flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}