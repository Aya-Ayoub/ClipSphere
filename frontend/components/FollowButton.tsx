"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ targetUserId, initialFollowing = false }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (!user || user._id === targetUserId) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(targetUserId);
        setFollowing(false);
      } else {
        await followUser(targetUserId);
        setFollowing(true);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
        following
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-purple-600 hover:bg-purple-700 text-white"
      }`}
    >
      {loading ? "..." : following ? "Unfollow" : "Follow"}
    </button>
  );
}