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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">ClipSphere</h1>
        <p className="text-zinc-400 text-sm">Short videos. Big moments.</p>
      </div>

      {/* Feed tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchFeed(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              feed === tab.id
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <VideoFeed feedType={feed} />
    </div>
  );
}