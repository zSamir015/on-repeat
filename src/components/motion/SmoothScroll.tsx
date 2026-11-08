"use client";

import Lenis from "lenis";
import { motionValue } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Scroll velocity in px/frame, written by Lenis. Read anywhere with useSpring/useTransform. */
export const scrollVelocity = motionValue(0);

let lenis: Lenis | null = null;

/** Pause or resume smooth scrolling (e.g. while a full-screen menu is open). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const instance = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
    instance.on("scroll", (l: Lenis) => scrollVelocity.set(l.velocity));
    lenis = instance;

    return () => {
      instance.destroy();
      lenis = null;
      scrollVelocity.set(0);
    };
  }, []);

  // A new page starts at the top, without Lenis easing back from the old position.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
