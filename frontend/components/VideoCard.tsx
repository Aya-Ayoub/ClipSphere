// PERSON B
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { deleteVideo } from "@/services/api";
import api from "@/services/api";
import { useEffect, useState } from "react";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VideoCardProps {
  video: any;
  onDelete?: (id: string) => void;
}

export default function VideoCard({ video, onDelete }: VideoCardProps) {
  const { user } = useAuth();
  const router   = useRouter();

  const isOwner = user && video.owner?._id === user._id;
  const isAdmin = user?.role === "admin";

  // ── Like state (your existing logic, kept exactly) ──────────────────────
  const [likeData, setLikeData] = useState({ count: 0, liked: false });

  useEffect(() => {
    let mounted = true;
    api.get(`/videos/${video._id}/like`)
      .then((res) => {
        if (!mounted) return;
        setLikeData({ count: res.data.count, liked: res.data.liked });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [video._id]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this video?")) return;
    try {
      await deleteVideo(video._id);
      onDelete?.(video._id);
    } catch {
      alert("Failed to delete video.");
    }
  };

  return (
    <article
      onClick={() => router.push(`/videos/${video._id}`)}
      className="group block cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-zinc-800 overflow-hidden">
        {video.signedUrl ? (
          <video
            src={video.signedUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            muted
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md font-mono">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Trending score badge (Phase 3 bonus) */}
        {video.trendingScore > 0 && (
          <span className="absolute top-2 left-2 bg-purple-600/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md">
            🔥 {video.trendingScore}
          </span>
        )}

        {/* ── Glassmorphism play overlay (Phase 3) ─────────────────────── */}
        <div
          className="absolute inset-0 flex items-center justify-center
                     bg-gradient-to-t from-black/60 via-transparent to-transparent
                     opacity-0 group-hover:opacity-100 transition-all duration-300
                     backdrop-blur-[1px]"
          aria-hidden="true"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center
                          bg-white/10 backdrop-blur-md border border-white/20
                          shadow-lg shadow-black/30
                          scale-75 group-hover:scale-100 transition-transform duration-300">
            <span className="text-white text-xl ml-1">▶</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">@{video.owner?.username || "unknown"}</span>
          {/* Like count (your existing display) */}
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <span className="text-purple-400">💜</span>
            {likeData.count}
          </div>
        </div>

        {/* Owner / admin actions */}
        {(isOwner || isAdmin) && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-800">
            {isOwner && (
              <Link
                href={`/videos/${video._id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-zinc-400 hover:text-purple-400 transition-colors"
              >
                Edit
              </Link>
            )}
            <button
              onClick={handleDelete}
              aria-label={`Delete ${video.title}`}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}