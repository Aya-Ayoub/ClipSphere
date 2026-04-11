"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Cookies from "js-cookie";
import { getMe } from "@/services/api";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  bio?: string;
  avatarKey?: string;
  active: boolean;
  accountStatus: string;
  preferences?: {
    inApp: { followers: boolean; comments: boolean; likes: boolean; tips: boolean };
    email: { followers: boolean; comments: boolean; likes: boolean; tips: boolean };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (token: string, userData: User) => void;
  logoutUser: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          Cookies.remove("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token: string, userData: User) => {
    Cookies.set("token", token, { expires: 1 });
    setUser(userData);
  };

  const logoutUser = () => {
    Cookies.remove("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}