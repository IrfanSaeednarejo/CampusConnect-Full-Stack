import React from 'react';

/**
 * Skeleton — shimmer-loading placeholder component.
 * Use variant="text|circle|card|line" for preset shapes,
 * or pass custom className for width/height.
 */
const variants = {
  text: 'h-4 w-3/4 rounded',
  circle: 'w-10 h-10 rounded-full',
  card: 'h-[200px] w-full rounded-xl',
  line: 'h-3 w-full rounded',
  avatar: 'w-12 h-12 rounded-full',
  title: 'h-6 w-1/2 rounded',
  button: 'h-9 w-24 rounded-lg',
};

export default function Skeleton({ variant = 'text', className = '', count = 1 }) {
  const baseClass = variants[variant] || variants.text;
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${baseClass} ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * SkeletonCard — a complete card placeholder with avatar, title, and lines.
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton variant="title" />
          <Skeleton variant="line" className="w-1/3" />
        </div>
      </div>
      <Skeleton variant="line" count={lines} className="mt-1" />
    </div>
  );
}

/**
 * SkeletonList — renders multiple SkeletonCards in a vertical list.
 */
export function SkeletonList({ count = 3, lines = 2 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}
