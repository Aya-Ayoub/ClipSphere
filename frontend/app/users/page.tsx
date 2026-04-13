// PERSON B
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getVideos } from "@/services/api";
import api from "@/services/api";

export default function UsersPage() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    // Fetch users from the most active aggregation via admin stats
    // or get unique owners from the public video feed
    api.get("/videos", { params: { limit: 100 } })
      .then((res) => {
        const videos = res.data.data || [];
        // Extract unique users from video owners
        const userMap = new Map();
        videos.forEach((v: any) => {
          if (v.owner && !userMap.has(v.owner._id)) {
            userMap.set(v.owner._id, v.owner);
          }
        });
        setUsers(Array.from(userMap.values()));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="skeleton h-10 rounded-lg mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Creators</h1>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="user-search" className="sr-only">Search users</label>
        <input
          id="user-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-4">👤</div>
          <p>{search ? "No users found." : "No creators yet."}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((u: any) => (
            <li key={u._id}>
              <Link
                href={`/profile/${u._id}`}
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors">
                    @{u.username}
                  </p>
                  {u.bio && (
                    <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5">{u.bio}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}