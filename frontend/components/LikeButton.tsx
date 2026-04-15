"use client";

import { useState } from "react";
import { likeVideo, unlikeVideo } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface LikeButtonProps {
  videoId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({
  videoId,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const { user } = useAuth();

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  if (!user)
    return (
      <span className="text-zinc-500 text-sm flex items-center gap-1">
        <span>❤️</span> {count}
      </span>
    );

  const handleClick = async () => {
    if (loading) return;

    const nextLiked = !liked;

    // optimistic UI update (SAFE VERSION)
    setLiked(nextLiked);
    setCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    setLoading(true);

    try {
      if (nextLiked) {
        await likeVideo(videoId);
      } else {
        await unlikeVideo(videoId);
      }
    } catch (err) {
      // revert on error
      setLiked(liked);
      setCount((prev) => (nextLiked ? prev - 1 : prev + 1));

      console.error("Like action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 border
        ${
          liked
            ? "bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-purple-500/40 hover:text-white hover:bg-zinc-800"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span className="text-base">{liked ? "💜" : "🤍"}</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}