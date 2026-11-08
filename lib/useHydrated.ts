import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during server render and hydration, true afterwards. Use it before reading localStorage or window. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
