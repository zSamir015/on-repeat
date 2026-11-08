"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { audioLevel } from "../player/PlayerProvider";
import { LOGO } from "./logo-geometry";

type Props = {
  /** `full`: ‖: on repeat :‖ — `mark`: ‖:‖ */
  variant?: "full" | "mark";
  /** Rendered height in px; width follows the artwork. */
  height?: number;
  className?: string;
  /** Dot color. Ember Red by default; pass "currentColor" for the one-color version. */
  accent?: string;
  /** Bars rise and dots pop in on mount. */
  intro?: boolean;
  /** Intro waits for the logo to scroll into view instead of running on mount. */
  introOnView?: boolean;
  delay?: number;
  /** Fill the container's width instead of a fixed height. */
  fluid?: boolean;
};

const easeOut = [0.23, 1, 0.32, 1] as const;

/**
 * The On Repeat logo: the name between the two musical repeat signs, because in notation
 * everything between ‖: and :‖ is played again. Bars and word take `currentColor`;
 * the dots carry the brand red and pulse with whatever the player is sounding.
 */
export function Logo({
  variant = "full",
  height = 22,
  className = "",
  accent = "var(--color-ember-red)",
  intro = false,
  introOnView = false,
  delay = 0,
  fluid = false,
}: Props) {
  const reduce = useReducedMotion() ?? false;
  const parts = variant === "full" ? LOGO.full : LOGO.mark;
  const width = variant === "full" ? LOGO.fullWidth : LOGO.markWidth;

  // Dots breathe with the bass of the current preview.
  const level = useSpring(audioLevel, { stiffness: 500, damping: 30 });
  const pulse = useTransform(level, [0, 1], [1, 1.9]);

  const animateIn = intro && !reduce;
  const trigger = introOnView ? { whileInView: "in" as const, viewport: { once: true, margin: "-40px" } } : { animate: "in" as const };

  let bar = 0;
  let dot = 0;

  return (
    <motion.svg
      viewBox={`0 ${LOGO.top} ${width} ${LOGO.height}`}
      height={fluid ? undefined : height}
      width={fluid ? "100%" : (height * width) / LOGO.height}
      role="img"
      aria-label="On Repeat"
      className={`block shrink-0 overflow-visible ${className}`}
      initial={animateIn ? "out" : false}
      {...(animateIn ? trigger : {})}
    >
      {parts.map((p, i) => {
        if (p.t === "rect") {
          const k = bar++;
          return (
            <motion.rect
              key={i}
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              fill="currentColor"
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              variants={{
                out: { scaleY: 0 },
                in: { scaleY: 1, transition: { duration: 0.6, ease: easeOut, delay: delay + k * 0.06 } },
              }}
            />
          );
        }
        const k = dot++;
        return (
          <motion.g
            key={i}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            variants={{
              out: { scale: 0 },
              in: { scale: 1, transition: { type: "spring", duration: 0.5, bounce: 0.45, delay: delay + 0.3 + k * 0.05 } },
            }}
          >
            <motion.circle
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={accent}
              style={reduce ? undefined : { scale: pulse, transformBox: "fill-box", transformOrigin: "50% 50%" }}
            />
          </motion.g>
        );
      })}
      {variant === "full" && (
        <motion.path
          d={LOGO.wordPath}
          fill="currentColor"
          variants={{
            out: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
            in: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 0.7, ease: easeOut, delay: delay + 0.2 } },
          }}
        />
      )}
    </motion.svg>
  );
}
