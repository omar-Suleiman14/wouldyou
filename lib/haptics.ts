export type HapticType =
  | "impactLight"
  | "impactMedium"
  | "impactHeavy"
  | "notificationSuccess"
  | "panicRun"
  | "celebrationBoom"
  | "tick";

/**
 * Clean haptics utility using standard Web Vibration API.
 * Safely handles unsupported browsers/iOS Safari without throwing errors.
 */
export function triggerHaptic(type: HapticType = "impactLight"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "tick":
        navigator.vibrate(5);
        break;
      case "impactLight":
        navigator.vibrate(15);
        break;
      case "impactMedium":
        navigator.vibrate(30);
        break;
      case "impactHeavy":
        navigator.vibrate(50);
        break;
      case "panicRun":
        // Darting/wobble pattern as button escapes
        navigator.vibrate([20, 30, 20, 30, 40]);
        break;
      case "notificationSuccess":
        navigator.vibrate([35, 50, 75]);
        break;
      case "celebrationBoom":
        // Big multi-pulse fanfare
        navigator.vibrate([60, 40, 80, 40, 120, 60, 200]);
        break;
      default:
        navigator.vibrate(20);
        break;
    }
  } catch {
    // Silently ignore vibration errors (e.g. user hasn't interacted with document yet)
  }
}
