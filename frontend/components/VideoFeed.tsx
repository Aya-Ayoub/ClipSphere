"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import VideoCard from "./VideoCard";
import { getVideos, getTrendingVideos, getFollowingFeed } from "@/services/api";

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800" aria-hidden="true">
      <div className="skeleton aspect-video" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
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
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchVideos = useCallback(async (pageNum: number) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 9 };
      let res;
      if (feedType === "trending")       res = await getTrendingVideos(params);
      else if (feedType === "following") res = await getFollowingFeed(params);
      else                               res = await getVideos(params);

      const newVideos = res.data.data || [];
      if (newVideos.length < 9) setHasMore(false);
      setVideos((prev) => pageNum === 1 ? newVideos : [...prev, ...newVideos]);
    } catch (err) {
      console.error("Feed fetch error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [feedType, loading, hasMore]);

  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
  }, [feedType]);

  useEffect(() => {
    fetchVideos(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, feedType]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} onDelete={handleDelete} />
        ))}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>

      {!loading && videos.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-4xl mb-4" aria-hidden="true">🎬</div>
          <p>No videos yet.</p>
        </div>
      )}

      <div ref={loaderRef} className="h-8 mt-4" aria-hidden="true" />

      {!hasMore && videos.length > 0 && (
        <p className="text-center text-zinc-600 text-sm py-8">You&apos;ve reached the end</p>
      )}
    </section>
  );
}