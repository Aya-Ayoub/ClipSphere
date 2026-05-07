// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

interface Transaction {
  _id: string;
  sender: { username: string } | string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  message?: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  failed:    "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<"all" | "completed" | "pending" | "failed">("all");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/stripe/wallet")
      .then((res) => setTransactions(res.data.data?.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.status === filter);

  const totalEarned = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0) / 100;

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        <div className="h-24 bg-zinc-800 rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-zinc-500 text-sm mt-1">All tips you&apos;ve received</p>
      </div>

      {/* Summary card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-zinc-400 text-xs mb-1">Total Earned</p>
        <p className="text-3xl font-bold text-white">${totalEarned.toFixed(2)}</p>
        <p className="text-zinc-500 text-xs mt-1">{transactions.filter(t => t.status === "completed").length} completed tips</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "completed", "pending", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-3xl mb-3">💸</p>
          <p>No {filter === "all" ? "" : filter} transactions yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((tx) => {
            const senderName =
              typeof tx.sender === "object" && tx.sender !== null
                ? (tx.sender as { username: string }).username
                : "Unknown";

            return (
              <li
                key={tx._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white">
                    {senderName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">@{senderName}</p>
                    {tx.message && (
                      <p className="text-zinc-400 text-xs truncate">&ldquo;{tx.message}&rdquo;</p>
                    )}
                    <p className="text-zinc-600 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-white font-semibold text-sm">
                    ${(tx.amount / 100).toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusStyles[tx.status] || ""}`}>
                    {tx.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}