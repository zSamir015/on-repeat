"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./brand/Logo";
import { SiteMenu } from "./SiteMenu";

/** Appears once the dark stage has scrolled away. Red type on white; color does the hierarchy. */
export function LightNav() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > window.innerHeight * 0.9;
    if (next !== shown) setShown(next);
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: shown ? "0%" : "-100%" }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-x-0 top-0 z-50 bg-paper"
      inert={!shown}
    >
      <div className="shell flex h-[58px] items-center justify-between">
        <Link href="/" aria-label="On Repeat, inicio" className="text-obsidian">
          <Logo height={26} />
        </Link>
        <SiteMenu tone="red" inlineFrom="sm" />
      </div>
    </motion.header>
  );
}
