"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { setCustomHeroDrop, setStudioOpen, useStudioState } from "@/content/custom-drop";
import { findRelease, heroDrops, leadSingle, releases } from "@/content/releases";
import { PlayIcon } from "./player/PlayIcon";
import { usePlayer } from "./player/PlayerProvider";
import { scrollVelocity } from "./motion/SmoothScroll";
import { useStageActive } from "./motion/useStageActive";
import { Logo } from "./brand/Logo";
import { RotatingBadge } from "./RotatingBadge";
import { SiteMenu } from "./SiteMenu";
import { ChromeWordmark } from "./three/lazy";

const NAV = [
  { label: "Drops", href: "#drops" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Artistas", href: "#artistas" },
  { label: "Marca", href: "/marca" },
];

const easeOut = [0.23, 1, 0.32, 1] as const;

export function HeroStage() {
  const reduce = useReducedMotion() ?? false;
  const [stageRef, active] = useStageActive<HTMLElement>("0px");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { customDrop } = useStudioState();
  const player = usePlayer();

  const activeDrop = customDrop ?? heroDrops[selectedIdx] ?? heroDrops[0];
  const release = findRelease(activeDrop.slug) ?? releases[0];
  const sounding = player.isPlaying(release.slug);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });

  // Scroll-velocity lean: the chrome type shears with the speed of the scroll, then settles.
  const velocity = useSpring(scrollVelocity, { stiffness: 400, damping: 50 });
  const skewY = useTransform(velocity, [-40, 0, 40], [5, 0, -5], { clamp: true });

  // Leaving the stage: the chrome type sinks and recedes while the page slides over it.
  const sink = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const recede = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={stageRef}
      aria-label={`${activeDrop.artist}, ${activeDrop.title}`}
      className="on-dark relative isolate flex h-svh min-h-[600px] w-full flex-col overflow-hidden bg-obsidian text-paper"
    >
      <nav aria-label="Principal" className="relative z-10 shell flex items-center justify-between pt-[26px]">
        <motion.ul
          className="flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[14px] leading-[1.5]"
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
        >
          <motion.li variants={navItem}>
            <Link href="/" aria-label="On Repeat, inicio" className="block py-[6px] text-paper">
              <Logo height={26} intro delay={0.15} />
            </Link>
          </motion.li>
          {NAV.map((item) => (
            <Fragment key={item.href}>
              <motion.li variants={navItem} aria-hidden className="hidden text-graphite sm:list-item">
                →
              </motion.li>
              <motion.li variants={navItem} className="hidden sm:list-item">
                {item.href.startsWith("/") ? (
                  <Link href={item.href} className="text-paper no-underline hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className="text-paper no-underline hover:underline">
                    {item.label}
                  </a>
                )}
              </motion.li>
            </Fragment>
          ))}
        </motion.ul>
        <a
          href="#subir"
          onClick={() => setStudioOpen(true)}
          className="hidden border border-paper/30 px-[14px] py-[6px] text-[13px] font-medium text-paper no-underline transition-colors hover:border-paper hover:bg-paper hover:text-obsidian sm:inline-flex"
        >
          Sube tu música
        </a>
        <div className="sm:hidden">
          <SiteMenu inlineFrom="sm" />
        </div>
      </nav>

      <motion.div
        className="absolute inset-0 -z-0"
        style={reduce ? undefined : { skewY, y: sink, scale: recede, opacity: fade }}
      >
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: easeOut, delay: 0.1 }}
        >
          <ChromeWordmark
            text={activeDrop.artist}
            textNarrow={activeDrop.artistMobile}
            reduceMotion={reduce}
            accents={activeDrop.accents}
            active={active}
          />
        </motion.div>
      </motion.div>

      {/* Accessible name for the 3D type */}
      <h1 className="sr-only">{activeDrop.artist}</h1>

      <div className="relative z-10 mt-auto shell pb-[28px]">
        {/* Stage Artist Selector */}
        <motion.div
          className="mb-[20px] flex flex-wrap items-center gap-[8px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.45 }}
          role="group"
          aria-label="Cambiar artista en el escenario 3D"
        >
          <span className="mr-[6px] text-[11px] tracking-[0.12em] text-graphite uppercase">EN ESCENA</span>
          {heroDrops.map((drop, i) => {
            const isSelected = !customDrop && i === selectedIdx;
            return (
              <button
                key={drop.slug}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  if (customDrop) setCustomHeroDrop(null);
                  setSelectedIdx(i);
                }}
                className={`h-[30px] border px-[10px] text-[12px] tabular-nums transition-colors ${
                  isSelected
                    ? "border-paper bg-paper font-medium text-obsidian"
                    : "border-paper/25 text-paper/70 hover:border-paper/60 hover:text-paper"
                }`}
              >
                0{i + 1} · {drop.artist}
              </button>
            );
          })}
          {customDrop && (
            <button
              type="button"
              onClick={() => setCustomHeroDrop(null)}
              aria-pressed={true}
              className="flex h-[30px] items-center gap-[6px] border border-ember-red bg-ember-red px-[10px] text-[12px] font-medium text-obsidian"
            >
              <span>TU DROP · {customDrop.artist}</span>
              <span aria-hidden>×</span>
            </button>
          )}
        </motion.div>

        <div className="flex items-end justify-between gap-6 border-t border-paper/15 pt-[20px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeDrop.artist + activeDrop.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="min-w-0"
            >
              <Link
                href={`/album/${release.slug}`}
                className="group flex items-end gap-[20px] text-paper no-underline"
              >
                <span className="relative hidden size-[112px] shrink-0 overflow-hidden bg-obsidian sm:block">
                  <Image
                    src={activeDrop.cover}
                    alt={`Portada de ${activeDrop.title}`}
                    width={112}
                    height={112}
                    priority
                    className="size-[112px] object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.06]"
                  />
                  {sounding && (
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-ember-red"
                      style={{ scaleX: player.progress }}
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-[10px]">
                    <p className="kicker">{activeDrop.format}</p>
                    {sounding && (
                      <span className="text-[12px] font-medium tracking-wider text-paper/80 uppercase">
                        · SONANDO: {release.track}
                      </span>
                    )}
                  </div>
                  <p className="mt-[8px] truncate text-heading-sm font-light text-paper group-hover:underline sm:text-heading">
                    {activeDrop.title}
                  </p>
                  <p className="mt-[6px] flex items-center gap-[12px] text-caption text-graphite">
                    <span>{activeDrop.status}</span>
                    <span className="text-paper/80 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-[4px]">
                      Ver álbum →
                    </span>
                  </p>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.9, bounce: 0.25, delay: 0.8 }}
            className="shrink-0"
          >
            <RotatingBadge
              label={sounding ? "SONANDO" : "ESCUCHA"}
              center={<PlayIcon playing={sounding} size={20} />}
              onClick={() => player.toggle(leadSingle(release))}
              ariaLabel={sounding ? `Pausar ${release.track}` : `Escuchar ${release.track}, de ${release.artist}`}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const navItem = {
  hidden: { opacity: 0, y: -8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};
