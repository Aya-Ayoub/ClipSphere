// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

interface Notification {
  _id: string;
  type: "follow" | "like" | "comment" | "tip";
  sender: { _id: string; username: string };
  read: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  follow:  { icon: "👤", label: "followed you",          color: "text-blue-400" },
  like:    { icon: "❤️", label: "liked your video",       color: "text-red-400"  },
  comment: { icon: "💬", label: "commented on your video",color: "text-green-400"},
  tip:     { icon: "💰", label: "sent you a tip",         color: "text-yellow-400"},
};

export default function ActivityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/notifications")
      .then((res) => setNotifications(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl animate-pulse bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-zinc-500 text-sm">Your recent notifications</p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-4">🔔</div>
          <p>No notifications yet.</p>
          <p className="text-sm mt-1">When someone likes or follows you, it will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || { icon: "🔔", label: "interacted with you", color: "text-zinc-400" };
            return (
              <li
                key={notif._id}
                className={`bg-zinc-900 border rounded-xl p-4 flex items-center gap-4 transition-all
                  ${notif.read ? "border-zinc-800" : "border-indigo-500/30 bg-indigo-950/20"}`}
              >
                <span className="text-2xl flex-shrink-0">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <Link
                      href={`/profile/${notif.sender?._id}`}
                      className="font-semibold hover:text-indigo-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{notif.sender?.username}
                    </Link>
                    {" "}
                    <span className={config.color}>{config.label}</span>
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" aria-label="Unread" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}