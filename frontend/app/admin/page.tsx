"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminStats,
  getAdminHealth,
  getAdminModeration,
  updateUserStatus
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

function StatCard({
  label,
  value,
  color = "text-indigo-400",
}: {
  label: string;
  value: any;
  color?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-zinc-500 text-xs mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? "—"}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/");
      return;
    }

    Promise.all([
      getAdminStats(),
      getAdminHealth(),
      getAdminModeration(),
    ])
      .then(([statsRes, healthRes, queueRes]) => {
        setStats(statsRes.data.data);
        setHealth(healthRes.data.data);
        setQueue(queueRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  // ✅ SIMPLE SAFE TOAST (no library, no errors)
  const showMessage = (msg: string) => {
    alert(msg); // replace later with real toast system if you want
  };

  const handleBan = async (userId: string, currentlyActive: boolean) => {
    try {
      await updateUserStatus(userId, { active: !currentlyActive });
      showMessage(currentlyActive ? "User banned." : "User unbanned.");
    } catch {
      showMessage("Action failed.");
    }
  };

  if (authLoading || loading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-4"
        aria-busy="true"
        aria-label="Loading dashboard"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Admin Dashboard
        </h1>
        <p className="text-zinc-500 text-sm">
          Platform overview and moderation tools
        </p>
      </div>

      {/* Stats */}
      <section aria-label="Platform statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers} />
          <StatCard
            label="Total Videos"
            value={stats?.totalVideos}
            color="text-emerald-400"
          />
          <StatCard
            label="Total Tips"
            value={stats?.totalTips}
            color="text-amber-400"
          />
          <StatCard
            label="DB Status"
            value={health?.database}
            color={
              health?.database === "connected"
                ? "text-emerald-400"
                : "text-red-400"
            }
          />
        </div>
      </section>

      {/* System health */}
      <section
        aria-label="System health"
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
      >
        <h2 className="font-semibold text-white mb-3">System Health</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-xs">Uptime</p>
            <p className="text-white">
              {health?.uptime ? `${Math.floor(health.uptime)}s` : "—"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-xs">Heap Used</p>
            <p className="text-white">
              {health?.memory?.heapUsed
                ? `${Math.round(
                    health.memory.heapUsed / 1024 / 1024
                  )} MB`
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-xs">Timestamp</p>
            <p className="text-white">
              {health?.timestamp
                ? new Date(health.timestamp).toLocaleTimeString()
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Moderation queue */}
      <section
        aria-label="Moderation queue"
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
      >
        <h2 className="font-semibold text-white mb-3">
          Moderation Queue
          {queue.length > 0 && (
            <span className="ml-2 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
              {queue.length}
            </span>
          )}
        </h2>

        {queue.length === 0 ? (
          <p className="text-zinc-500 text-sm">No flagged content.</p>
        ) : (
          <ul className="space-y-3">
            {queue.map((video: any) => (
              <li
                key={video._id}
                className="flex items-center justify-between border border-zinc-800 rounded-lg p-3"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {video.title}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    by @{video.owner?.username}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleBan(video.owner?._id, true)
                  }
                  aria-label={`Ban user ${video.owner?.username}`}
                  className="text-xs text-red-400 border border-red-400/30 px-3 py-1 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                  Ban User
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}