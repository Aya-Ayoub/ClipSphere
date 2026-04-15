// PERSON B
"use client";
import { useState } from "react";
import StarRating from "./StarRating";
import { createReview } from "@/services/api";

interface ReviewFormProps {
  videoId: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({ videoId, onSubmitted }: ReviewFormProps) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a rating."); return; }
    setLoading(true);
    setError("");
    try {
      await createReview(videoId, { rating, comment });
      setRating(0);
      setComment("");
      onSubmitted?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3" aria-label="Leave a review">
      <h3 className="font-semibold text-white">Leave a Review</h3>

      <div>
        <label className="block text-sm text-zinc-400 mb-1" id="star-rating-label">
          Rating *
        </label>
        <StarRating value={rating} onChange={setRating} aria-labelledby="star-rating-label" />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm text-zinc-400 mb-1">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}