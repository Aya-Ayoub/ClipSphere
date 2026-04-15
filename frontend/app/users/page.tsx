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
    api.get("/videos", { params: { limit: 100 } })
      .then((res) => {
        const videos = res.data.data || [];
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
      <div className="bg-black min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="h-10 rounded-lg mb-6 bg-gray-800 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
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
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-4">👤</div>
            <p>{search ? "No users found." : "No creators yet."}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((u: any) => (
              <li key={u._id}>
                <Link
                  href={`/profile/${u._id}`}
                  className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">
                      @{u.username}
                    </p>
                    {u.bio && (
                      <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{u.bio}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}