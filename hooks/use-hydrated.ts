"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  void onStoreChange;
  return () => {};
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
