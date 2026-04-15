"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VideoFeed from "@/components/VideoFeed";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const initialFeed = searchParams.get("feed") || "public";
  const [feed, setFeed] = useState(initialFeed);

  useEffect(() => {
    const urlFeed = searchParams.get("feed");
    if (urlFeed && urlFeed !== feed) {
      setFeed(urlFeed);
    }
  }, [searchParams]);

  const tabs = [
    { id: "public", label: "All Videos" },
    { id: "trending", label: "🔥 Trending" },
    ...(user ? [{ id: "following", label: "Following" }] : []),
  ];

  const switchFeed = (id: string) => {
    setFeed(id);
    router.replace(`/?feed=${id}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Hero */}
        <div>
          <h1 className="text-3xl font-bold">ClipSphere</h1>
          <p className="text-gray-400 text-sm mt-1">
            Short videos. Big moments.
          </p>
        </div>

        {/* Tabs Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex gap-2 flex-wrap">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchFeed(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                feed === tab.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed container */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <VideoFeed feedType={feed} />
        </div>

      </div>
    </div>
  );
}