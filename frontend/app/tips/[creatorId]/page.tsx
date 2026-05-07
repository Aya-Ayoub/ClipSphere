"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/services/api";
import api from "@/services/api";

const TIP_AMOUNTS = [1, 2, 5, 10, 20];

export default function TipPage() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [creator, setCreator] = useState<any>(null);
  const [amount, setAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!creatorId) return;
    getUser(creatorId)
      .then((res) => setCreator(res.data))
      .catch(() => setError("Creator not found."))
      .finally(() => setPageLoading(false));
  }, [creatorId]);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!finalAmount || finalAmount < 0.5) {
      setError("Minimum tip amount is $0.50");
      return;
    }
    if (user?._id === creatorId) {
      setError("You cannot tip yourself.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/stripe/tip/${creatorId}`, {
        amount: finalAmount,
        message,
      });
      window.location.href = res.data.data.sessionUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-md mx-auto px-4 py-10 space-y-4 animate-pulse">
          <div className="h-20 w-20 rounded-full bg-gray-800 mx-auto" />
          <div className="h-6 w-1/2 bg-gray-800 rounded mx-auto" />
          <div className="h-48 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto">

        {/* Creator info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
            {creator?.username?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-white">Send a tip to @{creator?.username}</h1>
          {creator?.bio && (
            <p className="text-gray-400 text-sm mt-1">{creator.bio}</p>
          )}
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

          {/* Preset amounts */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Amount</label>
            <div className="grid grid-cols-5 gap-2">
              {TIP_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => { setAmount(a); setCustomAmount(""); }}
                  className={`py-2 rounded-lg text-sm font-medium transition border ${
                    amount === a && !customAmount
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500/50"
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label htmlFor="custom-amount" className="block text-xs text-gray-400 mb-1">
              Custom amount ($)
            </label>
            <input
              id="custom-amount"
              type="number"
              min="0.50"
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 3.50"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="tip-message" className="block text-xs text-gray-400 mb-1">
              Message (optional)
            </label>
            <textarea
              id="tip-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Leave a message for the creator..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !finalAmount}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition shadow-sm hover:shadow-md"
          >
            {loading ? "Redirecting to payment..." : `Send $${finalAmount?.toFixed(2) || "0.00"}`}
          </button>

        </div>
      </div>
    </div>
  );
}