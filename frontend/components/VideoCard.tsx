// PERSON B
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { deleteVideo } from "@/services/api";

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
  const router = useRouter();

  const isOwner = user && video.owner?._id === user._id;
  const isAdmin = user?.role === "admin";

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
      className="group block cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
    >
      <div className="relative aspect-video bg-zinc-800 overflow-hidden">
        {video.signedUrl ? (
          <video
            src={video.signedUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            muted
            preload="metadata"
            aria-label={`Preview of ${video.title}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-mono">
            {formatDuration(video.duration)}
          </span>
        )}

        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-lg ml-1">▶</span>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">@{video.owner?.username || "unknown"}</span>
          <span className="text-xs text-zinc-600">{video.viewsCount ?? 0} views</span>
        </div>

        {(isOwner || isAdmin) && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-800">
            {isOwner && (
              <Link
                href={`/videos/${video._id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
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