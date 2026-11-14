"use client";

import { useSyncExternalStore } from "react";
import type { HeroDrop } from "./releases";

type StudioState = {
  customDrop: HeroDrop | null;
  studioOpen: boolean;
};

let state: StudioState = {
  customDrop: null,
  studioOpen: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function setCustomHeroDrop(drop: HeroDrop | null) {
  state = { ...state, customDrop: drop };
  emit();
}

export function setStudioOpen(open: boolean) {
  state = { ...state, studioOpen: open };
  emit();
}

export function useStudioState() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}
