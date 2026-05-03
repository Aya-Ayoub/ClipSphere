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

interface WalletData {
  totalEarned: number;
  pendingBalance: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/stripe/wallet")
      .then((res) => setWallet(res.data.data))
      .catch(() => setError("Could not load wallet data."))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
          <div className="h-8 w-32 bg-gray-800 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-gray-800 rounded-xl" />
            <div className="h-28 bg-gray-800 rounded-xl" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    failed:    "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="bg-black min-h-screen px-4 py-10 text-white">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-gray-400 text-sm mt-1">Your tips and earnings</p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500/40 transition">
            <p className="text-gray-400 text-xs mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-white">
              ${wallet?.totalEarned.toFixed(2) || "0.00"}
            </p>
            <p className="text-gray-500 text-xs mt-1">Completed tips</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500/40 transition">
            <p className="text-gray-400 text-xs mb-1">Pending</p>
            <p className="text-3xl font-bold text-white">
              ${wallet?.pendingBalance.toFixed(2) || "0.00"}
            </p>
            <p className="text-gray-500 text-xs mt-1">Awaiting confirmation</p>
          </div>
        </div>

        {/* Transaction history */}
        <section>
          <h2 className="font-semibold text-lg mb-3">
            Transaction History
            {wallet?.transactions.length ? (
              <span className="ml-2 text-gray-500 text-sm font-normal">
                ({wallet.transactions.length})
              </span>
            ) : null}
          </h2>

          {!wallet?.transactions.length ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <p className="text-gray-400 text-sm">No transactions yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {wallet.transactions.map((tx) => {
                const senderName =
                  typeof tx.sender === "object" && tx.sender !== null
                    ? (tx.sender as { username: string }).username
                    : "Unknown";

                return (
                  <li
                    key={tx._id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {senderName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">@{senderName}</p>
                        {tx.message && (
                          <p className="text-gray-400 text-xs truncate">{tx.message}</p>
                        )}
                        <p className="text-gray-500 text-xs">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
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
        </section>

      </div>
    </div>
  );
}