"use client";

import { useEffect, useRef, useState } from "react";

/** True while the element is on (or near) screen. Used to pause WebGL render loops off-screen. */
export function useStageActive<T extends Element>(margin = "200px") {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: margin,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, active] as const;
}
