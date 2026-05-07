"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import NotificationBubble from "./NotificationBubble";

interface Notification {
  id: string;
  type: "like" | "tip" | "follow";
  title: string;
  body: string;
}

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const router = useRouter();

  const socket = useSocket(user);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const pushNotification = useCallback((notif: Omit<Notification, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setActiveNotification({ ...notif, id });
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // new-like event
    const onLike = (data: { likerUsername: string; videoTitle: string }) => {
      pushNotification({
        type:  "like",
        title: "New Like 💜",
        body:  `@${data.likerUsername} liked your video "${data.videoTitle}"`,
      });
    };

    // new-tip event
    const onTip = (data: { senderUsername: string; amount: string; message: string }) => {
      pushNotification({
        type:  "tip",
        title: `You received a $${data.amount} tip! 💰`,
        body:  data.message
          ? `@${data.senderUsername}: "${data.message}"`
          : `@${data.senderUsername} sent you a tip`,
      });
    };

    // new-follow event — field is followerUsername (matches socketService)
    const onFollow = (data: { followerUsername: string }) => {
      pushNotification({
        type:  "follow",
        title: "New Follower 👤",
        body:  `@${data.followerUsername} started following you`,
      });
    };

    const onBadgeCleared = () => setUnreadCount(0);

    socket.on("new-like",      onLike);
    socket.on("new-tip",       onTip);
    socket.on("new-follow",    onFollow);
    socket.on("badge_cleared", onBadgeCleared);

    return () => {
      socket.off("new-like",      onLike);
      socket.off("new-tip",       onTip);
      socket.off("new-follow",    onFollow);
      socket.off("badge_cleared", onBadgeCleared);
    };
  }, [socket, pushNotification]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleActivityClick = () => {
    setUnreadCount(0);
    // Tell the server to mark notifications as read
    if (socket) socket.emit("mark_notifications_read");
  };

  return (
    <>
      {/* Notification Toast */}
      <NotificationBubble
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 h-16">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="text-xl font-bold text-purple-400 hover:text-purple-300 transition">
            ClipSphere
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition text-sm">
              Home
            </Link>

            <Link href="/users" className="text-gray-300 hover:text-white transition text-sm">
              Creators
            </Link>

            {user && (
              <Link href="/upload" className="text-gray-300 hover:text-white transition text-sm">
                Upload
              </Link>
            )}

            {/* Activity link with unread badge */}
            {user && (
              <Link
                href="/activity"
                onClick={handleActivityClick}
                className="relative text-gray-300 hover:text-white transition text-sm"
              >
                Activity
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1
                                   bg-red-500 text-white text-[10px] font-bold rounded-full
                                   flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user?.role === "admin" && (
              <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition text-sm">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/wallet" className="text-sm text-gray-300 hover:text-white transition" title="Creator Wallet">
                  Wallet
                </Link>

                <Link href="/settings" className="text-sm text-gray-300 hover:text-white transition">
                  {user.username}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg hover:border-purple-500/30 hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition">
                  Login
                </Link>
                <Link href="/register" className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}