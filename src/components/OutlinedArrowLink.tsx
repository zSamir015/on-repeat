"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";

type Props = {
  href: string;
  label: string;
  tone?: "obsidian" | "signal" | "current";
  external?: boolean;
};

const RADIUS = 90; // px from the arrow's center where the pull starts
const PULL = 0.35; // share of the pointer offset the arrow follows

/**
 * L-shaped line arrow, no text, no fill. Magnetic toward a nearby pointer (spring, so it keeps
 * velocity through direction changes) and redraws its stroke on hover.
 */
export function OutlinedArrowLink({ href, label, tone = "obsidian", external }: Props) {
  const reduce = useReducedMotion();
  const zone = useRef<HTMLSpanElement>(null);
  const [hot, setHot] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  function onMove(e: PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !zone.current) return;
    const r = zone.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const inside = Math.hypot(dx, dy) < RADIUS;
    x.set(inside ? dx * PULL : 0);
    y.set(inside ? dy * PULL : 0);
  }

  function reset() {
    x.set(0);
    y.set(0);
    setHot(false);
  }

  const color =
    tone === "signal" ? "var(--color-signal-blue)" : tone === "current" ? "currentColor" : "var(--color-obsidian)";

  return (
    // The listening zone is larger than the arrow so the pull begins before contact.
    <span
      ref={zone}
      className="relative -m-[30px] inline-block p-[30px]"
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <motion.a
        href={href}
        aria-label={label}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        style={{ x: sx, y: sy, color }}
        className="block p-2 outline-offset-2"
        onHoverStart={() => setHot(true)}
        onHoverEnd={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="50" height="38" viewBox="0 0 50 38" fill="none" aria-hidden>
          <motion.path
            d="M2 0 V30 H46 M38 22 L46 30 L38 38"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            initial={false}
            animate={hot && !reduce ? { pathLength: [0, 1] } : { pathLength: 1 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          />
        </svg>
      </motion.a>
    </span>
  );
}
