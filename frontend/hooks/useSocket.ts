"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

/**
 * useSocket — connects to Socket.io and returns the socket as STATE.
 *
 * Returning as state (not a ref) is critical: when the socket connects,
 * React re-renders the component and the useEffect in Navbar that
 * registers .on() listeners will actually fire with a live socket.
 *
 * If we returned a ref, the listeners would register against null
 * and never receive any events.
 */
export function useSocket(user: { _id: string } | null) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Disconnect and clear if user logs out
    if (!user?._id) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    const token = localStorage.getItem("token") || Cookies.get("token");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
      // Trigger re-render so Navbar's useEffect picks up the live socket
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  return socket;
}