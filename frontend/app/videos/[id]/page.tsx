// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import VideoPlayer  from "@/components/VideoPlayer";
import ReviewForm   from "@/components/ReviewForm";
import StarRating   from "@/components/StarRating";
import FollowButton from "@/components/FollowButton";
import { getVideo } from "@/services/api";
import { useAuth }  from "@/hooks/useAuth";

export default function VideoPage() {
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();

  const [video,   setVideo]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    getVideo(id)
      .then((res) => setVideo(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, refresh]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4" aria-busy="true" aria-label="Loading video">
        <div className="skeleton aspect-video rounded-xl" />
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-zinc-500" role="alert">
        Video not found.
      </div>
    );
  }

  const isOwner = user && video.owner?._id === user._id;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      <VideoPlayer src={video.signedUrl} title={video.title} />

      <div>
        <h1 className="text-xl font-bold text-white mb-1">{video.title}</h1>
        {video.description && (
          <p className="text-zinc-400 text-sm mb-3">{video.description}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-sm">
              by <span className="text-white font-medium">@{video.owner?.username}</span>
            </span>
            <FollowButton targetUserId={video.owner?._id} />
          </div>
          <span className="text-zinc-600 text-xs">{video.viewsCount} views</span>
        </div>

        {isOwner && (
          <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-800">
            <a
              href={`/videos/${video._id}/edit`}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Edit video
            </a>
          </div>
        )}
      </div>

      {user && !isOwner && (
        <ReviewForm videoId={video._id} onSubmitted={() => setRefresh((r) => r + 1)} />
      )}

      <section aria-label="Reviews">
        <h2 className="font-semibold text-white text-lg mb-3">
          Reviews {video.reviews?.length ? `(${video.reviews.length})` : ""}
        </h2>

        {(!video.reviews || video.reviews.length === 0) ? (
          <p className="text-zinc-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <ul className="space-y-3">
            {video.reviews.map((review: any) => (
              <li key={review._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating value={review.rating} readonly size="sm" />
                  <span className="text-zinc-400 text-xs">
                    @{review.user?.username || "user"}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-zinc-300 text-sm">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}