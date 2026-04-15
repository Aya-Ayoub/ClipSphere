// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getFollowing, getUser } from "@/services/api";

export default function FollowingPage() {
  const { id } = useParams<{ id: string }>();

  const [following, setFollowing] = useState<any[]>([]);
  const [profile,   setProfile]   = useState<any>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getFollowing(id), getUser(id)])
      .then(([followingRes, profileRes]) => {
        setFollowing(followingRes.data.data || followingRes.data);
        setProfile(profileRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href={`/profile/${id}`} className="text-gray-400 text-sm hover:text-white transition">
            ← Back to profile
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">
            {profile?.username ? `@${profile.username}` : ""} Following
          </h1>
          <p className="text-gray-400 text-sm">{following.length} following</p>
        </div>

        {following.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-4">👥</div>
            <p>Not following anyone yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {following.map((f: any) => {
              const followed = f.followingId;
              const userId   = followed?._id || f.followingId;
              const username = followed?.username || "unknown";

              return (
                <li key={f._id}>
                  <Link
                    href={`/profile/${userId}`}
                    className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {username[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">@{username}</p>
                      {followed?.bio && (
                        <p className="text-gray-400 text-xs line-clamp-1">{followed.bio}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}