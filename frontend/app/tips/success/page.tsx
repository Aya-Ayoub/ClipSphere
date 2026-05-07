"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
      return;
    }
    api
      .get(`/stripe/session/${sessionId}`)
      .then((res) => setSession(res.data.data))
      .catch(() => setSession({ amount: null }))
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse text-center">
        <div className="h-16 w-16 rounded-full bg-gray-800 mx-auto" />
        <div className="h-6 w-48 bg-gray-800 rounded mx-auto" />
        <div className="h-4 w-64 bg-gray-800 rounded mx-auto" />
      </div>
    );
  }

  const amountDisplay = session?.amount
    ? `$${(session.amount / 100).toFixed(2)}`
    : "your tip";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-4">

      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Payment successful</h1>
        <p className="text-gray-400 text-sm mt-1">
          {amountDisplay} has been sent successfully.
        </p>
        {session?.customerEmail && (
          <p className="text-gray-500 text-xs mt-1">
            Receipt sent to {session.customerEmail}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg transition text-sm font-medium"
        >
          Back to Home
        </Link>
        <Link
          href="/wallet"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-6 py-2.5 rounded-lg transition text-sm font-medium"
        >
          View Wallet
        </Link>
      </div>

    </div>
  );
}

export default function TipSuccessPage() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="space-y-4 animate-pulse text-center">
              <div className="h-16 w-16 rounded-full bg-gray-800 mx-auto" />
              <div className="h-6 w-48 bg-gray-800 rounded mx-auto" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}