"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  targetUserId: string;
  initialFollowing?: boolean;
}

export default function FollowButton({
  targetUserId,
  initialFollowing = false,
}: Props) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // self-follow protection
  if (!user || user._id === targetUserId) return null;

  const handleClick = async () => {
    if (loading) return;

    const prev = following;

    // optimistic UI
    setFollowing(!prev);
    setLoading(true);

    try {
      if (prev) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId);
      }
    } catch (err: any) {
      // handle "already following"
      if (err.response?.status === 400) {
        setFollowing(true);
      } else {
        setFollowing(prev);
      }

      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-sm px-4 py-1.5 rounded-lg transition ${
        following
          ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30"
          : "bg-purple-600 text-white hover:bg-purple-700"
      }`}
    >
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}