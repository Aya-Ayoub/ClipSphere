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

  if (!user) {
    return (
      <span className="text-gray-500 text-sm flex items-center gap-2">
        <span>❤️</span> {count}
      </span>
    );
  }

  const handleClick = async () => {
    if (loading) return;

    const nextLiked = !liked;

    // optimistic UI update
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
        liked
          ? "bg-purple-600 text-white border-purple-500/30 hover:bg-purple-700"
          : "bg-gray-900 text-gray-300 border-gray-800 hover:border-purple-500/30 hover:text-white hover:bg-gray-800"
      }`}
    >
      <span className="text-base">{liked ? "💜" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}