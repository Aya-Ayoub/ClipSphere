"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import ReviewForm from "@/components/ReviewForm";
import StarRating from "@/components/StarRating";
import FollowButton from "@/components/FollowButton";
import LikeButton from "@/components/LikeButton";
import { getVideo } from "@/services/api";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [likeData, setLikeData] = useState({
    count: 0,
    liked: false,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const videoRes = await getVideo(id);

        if (!isMounted) return;

        const data = videoRes.data.data;
        setVideo(data);

        const likeRes = await api.get(`/videos/${id}/like`);

        if (!isMounted) return;

        setLikeData({
          count: likeRes.data.count,
          liked: likeRes.data.liked,
        });
      } catch (err) {
        console.error("Failed to load video page:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id, refresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 animate-pulse">

          <div className="aspect-video bg-gray-800 rounded-xl" />
          <div className="h-6 w-2/3 bg-gray-800 rounded" />
          <div className="h-4 w-1/3 bg-gray-800 rounded" />

        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">
        Video not found.
      </div>
    );
  }

  const isOwner = user && video.owner?._id === user._id;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* VIDEO CARD */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <VideoPlayer src={video.signedUrl} title={video.title} />
        </div>

        {/* INFO CARD */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 hover:border-purple-500/20 transition">

          {/* Title */}
          <h1 className="text-xl font-bold">{video.title}</h1>

          {/* Description */}
          {video.description && (
            <p className="text-gray-400 text-sm">
              {video.description}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex items-center justify-between flex-wrap gap-4">

            {/* Owner */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>
                by{" "}
                <span className="text-white font-medium">
                  @{video.owner?.username}
                </span>
              </span>

              <FollowButton targetUserId={video.owner?._id} />
            </div>

            {/* Like */}
            <LikeButton
              videoId={video._id}
              initialLiked={likeData.liked}
              initialCount={likeData.count}
            />
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="pt-3 border-t border-gray-800">
              <a
                href={`/videos/${video._id}/edit`}
                className="text-sm text-purple-400 hover:text-purple-300 transition"
              >
                Edit video
              </a>
            </div>
          )}
        </div>

        {/* REVIEW FORM */}
        {user && !isOwner && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <ReviewForm
              videoId={video._id}
              onSubmitted={() => setRefresh((r) => r + 1)}
            />
          </div>
        )}

        {/* REVIEWS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">

          <h2 className="font-semibold text-lg">
            Reviews {video.reviews?.length ? `(${video.reviews.length})` : ""}
          </h2>

          {!video.reviews?.length ? (
            <p className="text-gray-500 text-sm">
              No reviews yet. Be the first!
            </p>
          ) : (
            <ul className="space-y-3">
              {video.reviews.map((review: any) => (
                <li
                  key={review._id}
                  className="bg-gray-800/40 border border-gray-800 rounded-lg p-4 hover:border-purple-500/20 transition"
                >

                  <div className="flex items-center gap-3 mb-2">
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-gray-400 text-xs">
                      @{review.user?.username || "user"}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-gray-300 text-sm">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}