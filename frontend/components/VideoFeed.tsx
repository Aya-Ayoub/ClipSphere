// PERSON B
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import VideoCard from "./VideoCard";
import { getVideos, getTrendingVideos, getFollowingFeed } from "@/services/api";

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 animate-pulse" aria-hidden="true">
      <div className="aspect-video bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  );
}

interface VideoFeedProps {
  feedType?: string;
}

export default function VideoFeed({ feedType = "public" }: VideoFeedProps) {
  const [videos,  setVideos]  = useState<any[]>([]);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef  = useRef<HTMLDivElement>(null);
  // Your existing request deduplication — kept exactly
  const requestId  = useRef(0);

  const fetchVideos = useCallback(async (pageNum: number) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 9 };
      let res;
      if (feedType === "trending")       res = await getTrendingVideos(params);
      else if (feedType === "following") res = await getFollowingFeed(params);
      else                               res = await getVideos(params);

      // ignore stale responses (your logic)
      if (currentRequest !== requestId.current) return;

      const newVideos = res.data.data || [];
      setVideos((prev) => pageNum === 1 ? newVideos : [...prev, ...newVideos]);
      setHasMore(newVideos.length === 9);
    } catch (err) {
      console.error("Feed fetch error:", err);
      if (currentRequest === requestId.current) setHasMore(false);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [feedType]);

  // Reset cleanly when switching feeds (your logic)
  useEffect(() => {
    requestId.current++;
    setVideos([]);
    setPage(1);
    setHasMore(true);
  }, [feedType]);

  useEffect(() => {
    fetchVideos(page);
  }, [page, fetchVideos]);

  // Intersection Observer — infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const handleDelete = (deletedId: string) => {
    setVideos((prev) => prev.filter((v) => v._id !== deletedId));
  };

  return (
    <section aria-label="Video feed" {...(loading ? { "aria-busy": "true" } : {})}>
      {/* Responsive grid: 1 col mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} onDelete={handleDelete} />
        ))}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Empty state */}
      {!loading && videos.length === 0 && hasMore === false && (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-4" aria-hidden="true">🎬</div>
          <p>No videos yet.</p>
          {feedType === "following" && (
            <p className="text-sm mt-2">Follow some creators to see their videos here.</p>
          )}
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="h-8 mt-4" aria-hidden="true" />

      {/* End of feed */}
      {!hasMore && videos.length > 0 && (
        <p className="text-center text-zinc-600 text-sm py-8">
          You&apos;ve reached the end
        </p>
      )}
    </section>
  );
}