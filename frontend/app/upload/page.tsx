// PERSON B
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadVideo } from "@/services/api";

export default function UploadPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", status: "public",
  });
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { setError("Title is required."); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title",       form.title);
    formData.append("description", form.description);
    formData.append("status",      form.status);
    if (file)  formData.append("video",    file);
    if (!file) formData.append("duration", "1");

    try {
      const res = await uploadVideo(formData);
      router.push(`/videos/${res.data.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">
          Upload a Video
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* File picker */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Select a video file to upload"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            className="border-2 border-dashed border-gray-700 hover:border-purple-500 focus:border-purple-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-gray-900/40 hover:bg-gray-900/70 shadow-sm hover:shadow-md"
          >
            {preview ? (
              <video src={preview} className="max-h-56 mx-auto rounded-lg border border-gray-800" controls />
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">🎬</div>
                <p className="text-gray-300 text-sm font-medium">
                  Click to select a video file
                </p>
                <p className="text-gray-500 text-xs">
                  MP4, MOV, WebM — max 5 minutes
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              id="video-file"
              type="file"
              accept="video/*"
              aria-label="Video file input"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="video-title" className="block text-sm text-gray-400 mb-1">
              Title *
            </label>
            <input
              id="video-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={100}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              placeholder="Give your video a title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="video-description" className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              id="video-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
              placeholder="What's this video about?"
            />
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="video-status" className="block text-sm text-gray-400 mb-1">
              Visibility
            </label>
            <select
              id="video-status"
              title="Video visibility"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {loading ? "Uploading..." : "Upload Video"}
          </button>

        </form>
      </div>
    </div>
  );
}