// PERSON B
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing,      setPlaying]      = useState(false);
  const [current,      setCurrent]      = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [muted,        setMuted]        = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Your exact toggle logic
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else         { videoRef.current.play();  setPlaying(true);  }
  };

  // Your exact seek logic
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
    <div
      className="relative bg-black rounded-xl overflow-hidden border border-zinc-800 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video */}
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

        {/* ── Glassmorphism play overlay (Phase 3) ─────────────────────── */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center
                          bg-gradient-to-t from-black/50 via-transparent to-transparent
                          backdrop-blur-[0.5px] pointer-events-none">
            <div className="w-20 h-20 rounded-full flex items-center justify-center
                            bg-white/10 backdrop-blur-md border border-white/20
                            shadow-2xl shadow-black/50">
              <span className="text-white text-3xl ml-2" aria-hidden="true">▶</span>
            </div>
          </div>
        )}

        {/* Duration overlay */}
        <div
          className="absolute top-3 right-3
                     bg-black/40 backdrop-blur-md border border-white/10
                     text-white text-xs px-2.5 py-1 rounded-lg font-mono"
          aria-label={`Duration: ${formatTime(duration)}`}
        >
          {formatTime(duration)}
        </div>
      </div>

      {/* ── Glassmorphism controls bar (Phase 3) ─────────────────────────── */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 py-3
                    bg-gradient-to-t from-black/80 to-transparent
                    backdrop-blur-sm border-t border-white/5
                    transition-opacity duration-300 space-y-2
                    ${showControls || !playing ? "opacity-100" : "opacity-0"}`}
      >
        {/* Progress bar — your exact keyboard logic kept */}
        <div
          className="h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all"
          tabIndex={0}
          aria-label="Video progress"
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (!videoRef.current) return;
            if (e.key === "ArrowRight") videoRef.current.currentTime = Math.min(duration, current + 5);
            if (e.key === "ArrowLeft")  videoRef.current.currentTime = Math.max(0, current - 5);
          }}
        >
          <div
            className="h-full bg-indigo-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons row — your exact buttons kept */}
        <div className="flex items-center gap-3 text-sm text-zinc-300">
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
          <span className="font-mono text-xs text-zinc-400" aria-live="off">
            {formatTime(current)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}