import React from 'react';

/**
 * EmptyState — a visually polished empty state component with icon, title, description, and optional CTA.
 * 
 * Usage:
 * <EmptyState
 *   icon="forum"
 *   title="No messages yet"
 *   description="Start a conversation with your classmates"
 *   actionLabel="New Message"
 *   onAction={() => ...}
 * />
 */
export default function EmptyState({
  icon = 'inbox',
  title = 'Nothing here yet',
  description = '',
  actionLabel = '',
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center animate-fadeIn ${className}`}>
      {/* Decorative circle with icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-text-tertiary">
            {icon}
          </span>
        </div>
        {/* Subtle glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl -z-10 scale-150" />
      </div>

      {/* Text */}
      <h3 className="text-text-primary text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">{description}</p>
      )}

      {/* CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
