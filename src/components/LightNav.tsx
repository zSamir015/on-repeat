"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./brand/Logo";
import { usePlayer } from "./player/PlayerProvider";
import { SiteMenu } from "./SiteMenu";

/** Appears once the dark stage has scrolled away. Red type on white; color does the hierarchy. */
export function LightNav() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  const { current, playing, toggle } = usePlayer();

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > window.innerHeight * 0.85;
    if (next !== shown) setShown(next);
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: shown ? "0%" : "-100%" }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-obsidian/10 bg-paper text-obsidian"
      inert={!shown}
    >
      <div className="shell flex h-[58px] items-center justify-between gap-[20px]">
        <div className="flex items-center gap-[20px]">
          <Link href="/" aria-label="On Repeat, inicio" className="text-obsidian">
            <Logo height={24} />
          </Link>
          {current && (
            <button
              type="button"
              onClick={() => toggle(current)}
              aria-label={playing ? `Pausar ${current.track}` : `Reproducir ${current.track}`}
              className="hidden items-center gap-[8px] border border-obsidian/20 px-[10px] py-[4px] text-[12px] text-obsidian transition-colors hover:border-obsidian md:inline-flex"
            >
              <span
                className={`size-[6px] ${playing ? "bg-ember-red" : "bg-graphite"}`}
                aria-hidden
              />
              <span className="max-w-[180px] truncate font-medium">{current.track}</span>
              <span className="text-graphite">· {current.artist}</span>
            </button>
          )}
        </div>
        <SiteMenu tone="red" inlineFrom="sm" />
      </div>
    </motion.header>
  );
}
