"use client";
import { useState, useRef } from "react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VideoPlayerProps {
  src?: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [playing,  setPlaying]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted,    setMuted]    = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      const newTime = ratio * duration;
      videoRef.current.currentTime = newTime;
      setCurrent(newTime);
    }
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className="bg-black rounded-xl overflow-hidden border border-zinc-800">

      {/* VIDEO */}
      <div
        className="relative aspect-video cursor-pointer"
        onClick={togglePlay}
        role="button"
        tabIndex={0}
        aria-label={playing ? "Pause video" : "Play video"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePlay();
          }
        }}
      >
        {src ? (
          <video
            ref={videoRef}
            src={src}
            muted={muted}
            title={title || "Video player"}
            className="w-full h-full object-contain"
            onTimeUpdate={() => setCurrent(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <span className="text-zinc-600">No video source</span>
          </div>
        )}

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
              <span className="text-white text-2xl ml-1" aria-hidden="true">▶</span>
            </div>
          </div>
        )}

        <div
          className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono"
          aria-label={`Duration: ${formatTime(duration)}`}
        >
          {formatTime(duration)}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-zinc-900 px-4 py-3 space-y-2">

        {/* PROGRESS BAR (ARIA REMOVED — axe-safe) */}
        <div
          className="h-1.5 bg-zinc-700 rounded-full cursor-pointer"
          tabIndex={0}
          aria-label="Video progress"
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (!videoRef.current) return;
            if (e.key === "ArrowRight") {
              videoRef.current.currentTime = Math.min(duration, current + 5);
            }
            if (e.key === "ArrowLeft") {
              videoRef.current.currentTime = Math.max(0, current - 5);
            }
          }}
        >
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <button
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="hover:text-white transition-colors text-lg"
          >
            {playing ? "⏸" : "▶"}
          </button>

          <button
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="hover:text-white transition-colors"
          >
            {muted ? "🔇" : "🔊"}
          </button>

          <span className="font-mono text-xs" aria-live="off">
            {formatTime(current)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}