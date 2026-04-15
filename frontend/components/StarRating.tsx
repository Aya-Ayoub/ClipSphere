"use client";
import { useState } from "react";

interface StarRatingProps {
  value?: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value = 0, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };

  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          {...(!readonly ? { "aria-pressed": value === star } : {})}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${sizes[size]} transition-transform ${
            !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
        >
          <span className={`${(hovered || value) >= star ? "text-amber-400" : "text-zinc-600"}`} aria-hidden="true">
            ★
          </span>
        </button>
      ))}
    </div>
  );
}