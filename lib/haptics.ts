export type HapticType = "light" | "escape" | "success";

const PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  escape: [12, 24, 12],
  success: [30, 40, 60],
};

/** Vibrates on devices that support it (Android). A no-op everywhere else. */
export function haptic(type: HapticType = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[type]);
  } catch {
    // Some browsers refuse before the first user gesture.
  }
}
