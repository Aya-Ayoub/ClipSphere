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

  //LIKE STATE
  const [likeData, setLikeData] = useState({
    count: 0,
    liked: false,
  });

  // FOLLOW STATE
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      try {
        // 1. GET VIDEO
        const videoRes = await getVideo(id);
        if (!isMounted) return;

        const data = videoRes.data.data;
        setVideo(data);

        // 2. GET LIKES
        const likeRes = await api.get(`/videos/${id}/like`);
        if (!isMounted) return;

        setLikeData({
          count: likeRes.data.count,
          liked: likeRes.data.liked,
        });

        if (user && data.owner?._id) {
          try {
            const res = await api.get(`/users/${data.owner._id}/follow-status`);

            if (isMounted) {
              setIsFollowing(res.data.following);
            }
          } catch (err) {
            console.error("Follow status error:", err);
          }
        }

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
  }, [id, refresh, user]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="skeleton aspect-video rounded-xl" />
          <div className="skeleton h-6 w-2/3" />
          <div className="skeleton h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-zinc-500">
        Video not found.
      </div>
    );
  }

  const isOwner = user && video.owner?._id === user._id;

  return (
    <main className="bg-black min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* VIDEO */}
        <VideoPlayer src={video.signedUrl} title={video.title} />

        {/* INFO */}
        <div>
          <h1 className="text-xl font-bold mb-1">{video.title}</h1>

          {video.description && (
            <p className="text-zinc-400 text-sm mb-3">
              {video.description}
            </p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">

            {/* OWNER + FOLLOW */}
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-sm">
                by{" "}
                <span className="text-white font-medium">
                  @{video.owner?.username}
                </span>
              </span>

              <FollowButton
                targetUserId={video.owner?._id}
                initialFollowing={isFollowing}
              />
            </div>

            {/* LIKE */}
            <LikeButton
              videoId={video._id}
              initialLiked={likeData.liked}
              initialCount={likeData.count}
            />
          </div>

          {/* OWNER ACTIONS */}
          {isOwner && (
            <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-800">
              <a
                href={`/videos/${video._id}/edit`}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition"
              >
                Edit video
              </a>
            </div>
          )}
        </div>

        {/* REVIEW FORM */}
        {user && !isOwner && (
          <ReviewForm
            videoId={video._id}
            onSubmitted={() => setRefresh((r) => r + 1)}
          />
        )}

        {/* REVIEWS */}
        <section>
          <h2 className="font-semibold text-lg mb-3">
            Reviews {video.reviews?.length ? `(${video.reviews.length})` : ""}
          </h2>

          {!video.reviews?.length ? (
            <p className="text-zinc-500 text-sm">
              No reviews yet. Be the first!
            </p>
          ) : (
            <ul className="space-y-3">
              {video.reviews.map((review: any) => (
                <li
                  key={review._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-zinc-400 text-xs">
                      @{review.user?.username || "user"}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-zinc-300 text-sm">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  );
}