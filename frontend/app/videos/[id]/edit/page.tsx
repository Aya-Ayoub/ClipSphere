// PERSON B
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVideo, updateVideo } from "@/services/api";

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getVideo(id)
      .then((res) => {
        const video = res.data.data;
        setForm({
          title: video.title || "",
          description: video.description || "",
        });
      })
      .catch(() => setError("Failed to load video."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateVideo(id, form);
      router.push(`/videos/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
          <div className="h-8 w-1/2 bg-gray-800 rounded" />
          <div className="h-10 bg-gray-800 rounded" />
          <div className="h-24 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 text-white">

        <h1 className="text-2xl font-bold mb-6">Edit Video</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm text-gray-400 mb-1"
            >
              Title *
            </label>

            <input
              id="edit-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={100}
              required
              placeholder="Enter video title"
              title="Video title"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm text-gray-400 mb-1"
            >
              Description
            </label>

            <textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
              rows={4}
              placeholder="Enter video description"
              title="Video description"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-2.5 rounded-xl transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/videos/${id}`)}
              className="bg-gray-800 hover:bg-gray-700 px-6 py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}