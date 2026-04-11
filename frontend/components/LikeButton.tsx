"use client";

import { useState } from "react";
import { likeVideo, unlikeVideo } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface LikeButtonProps {
  videoId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({ videoId, initialLiked = false, initialCount = 0 }: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  if (!user) return <span className="text-gray-400 text-sm">❤️ {count}</span>;

  const handleClick = async () => {
    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => liked ? prev - 1 : prev + 1);
    setLoading(true);

    try {
      if (liked) {
        await unlikeVideo(videoId);
      } else {
        await likeVideo(videoId);
      }
    } catch (err) {
      // Revert on failure
      setLiked((prev) => !prev);
      setCount((prev) => liked ? prev + 1 : prev - 1);
      console.error("Like action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 ${
        liked
          ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {liked ? "❤️" : "🤍"} {count}
    </button>
  );
}