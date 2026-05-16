"use client";

type ThemeTogglePillProps = {
  isDarkMode: boolean;
  onToggle: () => void;
  /** Extra surface styles (e.g. services page bar) */
  className?: string;
};

export function ThemeTogglePill({
  isDarkMode,
  onToggle,
  className = "",
}: ThemeTogglePillProps) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-8 w-[5.25rem] shrink-0 items-center rounded-full border border-ink/10 bg-canvas/75 p-1 text-[11px] font-semibold text-ink shadow-soft transition duration-180 hover:bg-canvas-subtle ${className}`}
      onClick={onToggle}
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`absolute left-2.5 z-10 transition-colors duration-180 ${
          isDarkMode ? "text-ink-muted" : "text-canvas"
        }`}
      >
        Light
      </span>
      <span
        className={`absolute right-2.5 z-10 transition-colors duration-180 ${
          isDarkMode ? "text-canvas" : "text-ink-muted"
        }`}
      >
        Dark
      </span>
      <span
        aria-hidden
        className={`relative z-0 h-6 w-[2.35rem] rounded-full bg-ink transition-transform duration-180 ${
          isDarkMode ? "translate-x-[2.15rem]" : "translate-x-0"
        }`}
      />
    </button>
  );
}
