"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 h-16">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        <Link href="/" className="text-xl font-bold text-purple-400">
           ClipSphere
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-300 hover:text-white transition">
            Home
          </Link>
          <Link href="/users" className="text-gray-300 hover:text-white transition">Creators</Link>
          {user && (
            <Link href="/upload" className="text-gray-300 hover:text-white transition">
              Upload
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/settings" className="text-sm text-gray-300 hover:text-white transition">
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}