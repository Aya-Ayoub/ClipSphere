// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getFollowers, getUser } from "@/services/api";

export default function FollowersPage() {
  const { id } = useParams<{ id: string }>();

  const [followers, setFollowers] = useState<any[]>([]);
  const [profile,   setProfile]   = useState<any>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getFollowers(id), getUser(id)])
      .then(([followersRes, profileRes]) => {
        setFollowers(followersRes.data.data || followersRes.data);
        setProfile(profileRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href={`/profile/${id}`} className="text-zinc-500 text-sm hover:text-white transition-colors">
          ← Back to profile
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">
          {profile?.username ? `@${profile.username}'s` : ""} Followers
        </h1>
        <p className="text-zinc-500 text-sm">{followers.length} followers</p>
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-4">👥</div>
          <p>No followers yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {followers.map((f: any) => {
            const follower = f.followerId;
            const userId   = follower?._id || f.followerId;
            const username = follower?.username || "unknown";

            return (
              <li key={f._id}>
                <Link
                  href={`/profile/${userId}`}
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">@{username}</p>
                    {follower?.bio && (
                      <p className="text-zinc-500 text-xs line-clamp-1">{follower.bio}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}