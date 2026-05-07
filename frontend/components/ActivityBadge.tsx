"use client";

interface ActivityBadgeProps {
  count: number;
  onClick?: () => void;
}

export default function ActivityBadge({ count, onClick }: ActivityBadgeProps) {
  if (count === 0) return null;

  const display = count > 99 ? "99+" : count.toString();

  return (
    <button
      onClick={onClick}
      aria-label={`${count} unread notification${count !== 1 ? "s" : ""}. Click to clear.`}
      className="relative inline-flex items-center justify-center"
    >
      <span className="text-sm text-gray-300 hover:text-white transition font-medium">
        Activity
      </span>
      <span
        className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        aria-hidden="true"
      >
        {display}
      </span>
    </button>
  );
}