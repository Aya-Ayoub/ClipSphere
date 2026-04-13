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
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-10 rounded-lg" />
        <div className="skeleton h-24 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Video</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="edit-title" className="block text-sm text-zinc-400 mb-1">
            Title *
          </label>
          <input
            id="edit-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={100}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm text-zinc-400 mb-1">
            Description
          </label>
          <textarea
            id="edit-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={500}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/videos/${id}`)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}