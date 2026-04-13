// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUser, getFollowers, getFollowing } from "@/services/api";
import FollowButton from "@/components/FollowButton";
import { useAuth }  from "@/hooks/useAuth";

export default function ProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();

  const [profile,   setProfile]   = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getUser(id), getFollowers(id), getFollowing(id)])
      .then(([profileRes, followersRes, followingRes]) => {
        setProfile(profileRes.data);
        setFollowers(followersRes.data.data || followersRes.data);
        setFollowing(followingRes.data.data || followingRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4" aria-busy="true" aria-label="Loading profile">
        <div className="skeleton h-20 w-20 rounded-full" />
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-zinc-500" role="alert">User not found.</div>;
  }

  const isMe = user?._id === id;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">

      <div className="flex items-start gap-5 mb-8">
        <div
          className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          aria-label={`${profile.username} avatar`}
        >
          {profile.username?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-white">@{profile.username}</h1>
            {profile.role === "admin" && (
              <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </div>

          {profile.bio && (
            <p className="text-zinc-400 text-sm mb-3">{profile.bio}</p>
          )}

          {/* Clickable follower/following counts */}
          <div className="flex gap-4 text-sm text-zinc-400 mb-3">
            <Link
              href={`/profile/${id}/followers`}
              className="hover:text-white transition-colors"
            >
              <strong className="text-white">{followers.length}</strong> followers
            </Link>
            <Link
              href={`/profile/${id}/following`}
              className="hover:text-white transition-colors"
            >
              <strong className="text-white">{following.length}</strong> following
            </Link>
          </div>

          {!isMe && <FollowButton targetUserId={id} />}

          {isMe && (
            <a
              href="/settings"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Edit profile
            </a>
          )}
        </div>
      </div>

      {/* Recent followers preview */}
      {followers.length > 0 && (
        <section aria-label="Followers preview" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Followers</h2>
            <Link href={`/profile/${id}/followers`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              See all →
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {followers.slice(0, 8).map((f: any) => (
              <li key={f._id}>
                <Link
                  href={`/profile/${f.followerId?._id || f.followerId}`}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  @{f.followerId?.username || "user"}
                </Link>
              </li>
            ))}
            {followers.length > 8 && (
              <li>
                <Link href={`/profile/${id}/followers`} className="text-sm text-zinc-500 hover:text-white transition-colors">
                  +{followers.length - 8} more
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Recent following preview */}
      {following.length > 0 && (
        <section aria-label="Following preview" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Following</h2>
            <Link href={`/profile/${id}/following`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              See all →
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2">
            {following.slice(0, 8).map((f: any) => (
              <li key={f._id}>
                <Link
                  href={`/profile/${f.followingId?._id || f.followingId}`}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  @{f.followingId?.username || "user"}
                </Link>
              </li>
            ))}
            {following.length > 8 && (
              <li>
                <Link href={`/profile/${id}/following`} className="text-sm text-zinc-500 hover:text-white transition-colors">
                  +{following.length - 8} more
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}
    </main>
  );
}