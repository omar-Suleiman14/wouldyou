import type { Colors, Effect } from "@/lib/templates";

// Fixed positions so server and client render the same thing.
const SPOTS = [
  [6, 82, 0], [14, 30, 3.2], [22, 64, 1.1], [31, 12, 5.4], [38, 88, 2.3], [47, 46, 6.1], [55, 74, 0.6],
  [63, 20, 4.4], [71, 58, 1.8], [79, 92, 3.7], [86, 36, 5.9], [93, 70, 2.9], [10, 52, 6.8], [67, 6, 7.4],
] as const;

function Heart({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill={color} aria-hidden>
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.5 1.1 4.3 2.4.8-1.3 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function Sparkle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill={color} aria-hidden>
      <path d="M12 2l1.8 6.9L21 12l-7.2 3.1L12 22l-1.8-6.9L3 12l7.2-3.1z" />
    </svg>
  );
}

export function Backdrop({ effect, colors }: { effect: Effect; colors: Colors }) {
  const kind = effect === "none" ? null : effect === "roses" ? "heart" : "sparkle";
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-0 top-0 h-[70%]"
        style={{ background: `radial-gradient(60% 60% at 50% 0%, color-mix(in srgb, ${colors.primary} 14%, transparent), transparent 70%)` }}
      />
      {kind &&
        SPOTS.map(([left, top, delay], i) => (
          <span
            key={i}
            className={kind === "heart" ? "x-float" : "x-twinkle"}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: kind === "heart" ? 14 + (i % 3) * 6 : 8 + (i % 3) * 4,
              height: kind === "heart" ? 14 + (i % 3) * 6 : 8 + (i % 3) * 4,
              animationDelay: `${delay}s`,
            }}
          >
            {kind === "heart" ? (
              <Heart color={i % 2 ? colors.secondary : colors.primary} />
            ) : (
              <Sparkle color={i % 2 ? colors.accent : colors.secondary} />
            )}
          </span>
        ))}
    </div>
  );
}
