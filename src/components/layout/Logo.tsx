import { useId } from "react";

export function Logo({ size = 26 }: { size?: number }) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ff3d77" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#1d1d22" />
      <rect x="6" y="6" width="20" height="20" rx="4.5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
      <rect x="11" y="11" width="10" height="10" rx="2.5" fill={`url(#${gradientId})`} />
    </svg>
  );
}
