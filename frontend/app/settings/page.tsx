"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateMe, updatePreferences } from "@/services/api";
import Toast from "@/components/Toast";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
  });
  const [prefs, setPrefs] = useState({
    inApp: user?.preferences?.inApp || {
      followers: true, comments: true, likes: true, tips: true,
    },
    email: user?.preferences?.email || {
      followers: true, comments: true, likes: true, tips: true,
    },
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateMe(form);
      setUser(res.data);
      setToast({ message: "Profile updated!", type: "success" });
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Update failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrefsSave = async () => {
    try {
      await updatePreferences(prefs);
      setToast({ message: "Preferences saved!", type: "success" });
    } catch {
      setToast({ message: "Failed to save preferences", type: "error" });
    }
  };

  const togglePref = (channel: "inApp" | "email", key: string) => {
    setPrefs((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], [key]: !prev[channel][key as keyof typeof prev.inApp] },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              maxLength={200}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>

        {(["inApp", "email"] as const).map((channel) => (
          <div key={channel} className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">
              {channel === "inApp" ? "In-App" : "Email"} Alerts
            </h3>
            <div className="space-y-2">
              {(["followers", "comments", "likes", "tips"] as const).map((key) => (
                <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="capitalize text-gray-300">{key}</span>
                  <div
                    onClick={() => togglePref(channel, key)}
                    className={`w-12 h-6 rounded-full transition cursor-pointer ${
                      prefs[channel][key] ? "bg-purple-600" : "bg-gray-700"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                      prefs[channel][key] ? "translate-x-6" : "translate-x-0.5"
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handlePrefsSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}