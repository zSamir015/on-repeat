"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, ViewTransition } from "react";
import { leadSingle, spotifySearch, type Release } from "@/content/releases";
import { OutlinedArrowLink } from "./OutlinedArrowLink";
import { PlayIcon } from "./player/PlayIcon";
import { usePlayer } from "./player/PlayerProvider";

const spring = { type: "spring", duration: 0.7, bounce: 0.15 } as const;

const column: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  shown: { opacity: 1, y: 0, transition: spring },
};

const kickerFor: Record<Release["format"], string> = {
  Single: "SINGLE",
  EP: "NEW EP",
  Album: "ALBUM",
};

function Showcase({
  release,
  index,
  total,
  flip,
}: {
  release: Release;
  index: number;
  total: number;
  flip: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const player = usePlayer();
  const lead = leadSingle(release);
  const sounding = player.isPlaying(lead.id);

  // The cover drifts slightly against the scroll, like a print pinned a few centimetres off the wall.
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <article id={release.slug} className="scroll-mt-[90px] grid items-center gap-[44px] md:grid-cols-12 md:gap-[25px]">
      <motion.div
        ref={frameRef}
        className={`group relative aspect-square overflow-hidden bg-obsidian md:col-span-6 ${flip ? "md:order-2 md:col-start-7" : ""}`}
        initial={reduce ? false : { clipPath: "inset(12% 12% 12% 12%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }}
      >
        {/* Oversized by 12% so the parallax drift never exposes an edge. */}
        <Link href={`/album/${release.slug}`} aria-label={`Ver ${release.title}`} className="absolute inset-0 block">
          <ViewTransition name={`cover-${release.slug}`} share="morph" default="none">
            <motion.div className="absolute inset-[-6%]" style={reduce ? undefined : { y: drift }}>
              <Image
                src={release.cover}
                alt={`Portada de ${release.title}, ${release.artist}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-out)] motion-safe:group-hover:scale-[1.04]"
              />
            </motion.div>
          </ViewTransition>
        </Link>

        {/* Quick play button in the bottom-left corner of the cover */}
        <button
          type="button"
          onClick={() => player.toggle(lead)}
          aria-label={sounding ? `Pausar ${release.track}` : `Escuchar preview de ${release.track}`}
          className="absolute bottom-0 left-0 z-10 flex h-[52px] items-center gap-[10px] px-[16px] text-[13px] font-medium transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96]"
          style={{ backgroundColor: release.ink, color: release.color }}
        >
          <PlayIcon playing={sounding} size={14} />
          <span>{sounding ? `Pausar · ${release.track}` : `Preview · ${release.track}`}</span>
        </button>
      </motion.div>

      <motion.div
        className={`md:col-span-5 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}
        variants={column}
        initial={reduce ? "shown" : "hidden"}
        whileInView="shown"
        viewport={{ once: true, margin: "-120px" }}
      >
        <motion.div variants={rise} className="flex items-center justify-between border-b border-current/25 pb-[12px] text-[13px] tracking-wider uppercase opacity-75">
          <span>{kickerFor[release.format]}</span>
          <span className="tabular-nums">
            0{index + 1} / 0{total}
          </span>
        </motion.div>
        <motion.h3 variants={rise} className="mt-[28px] text-heading-lg font-normal">
          <Link href={`/album/${release.slug}`} className="no-underline hover:underline">
            {release.title}
          </Link>
        </motion.h3>
        <motion.p variants={rise} className="mt-[10px] text-subheading">
          {release.artist}
        </motion.p>
        <motion.p variants={rise} className="mt-[23px] max-w-[46ch] text-body opacity-80">
          {release.blurb}
        </motion.p>
        <motion.p variants={rise} className="mt-[18px] text-caption opacity-70">
          {release.genre} · {release.year} · Single principal: {release.track}
        </motion.p>
        <motion.div variants={rise} className="mt-[44px] flex flex-wrap items-center gap-[20px]">
          <button
            type="button"
            onClick={() => player.toggle(lead)}
            className="flex h-[42px] items-center gap-[10px] px-[18px] text-[14px] font-medium transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96]"
            style={{ backgroundColor: release.ink, color: release.color }}
          >
            <PlayIcon playing={sounding} size={14} />
            <span>{sounding ? "Pausar" : "Escuchar preview"}</span>
          </button>
          <Link href={`/album/${release.slug}`} className="ghost-action ghost-action--current">
            Ver canciones
          </Link>
          <OutlinedArrowLink href={spotifySearch(release)} label={`Escuchar ${release.title} en Spotify`} tone="current" external />
        </motion.div>
      </motion.div>
    </article>
  );
}

/** Holds each color through its release and crossfades in the gap between two releases. */
function colorStops(colors: string[]) {
  const n = colors.length;
  const input: number[] = [];
  const output: string[] = [];
  colors.forEach((c, i) => {
    const center = n === 1 ? 0.5 : i / (n - 1);
    input.push(Math.max(0, center - 0.12), Math.min(1, center + 0.12));
    output.push(c, c);
  });
  return { input, output };
}

export function EditorialAlbumSection({ releases }: { releases: Release[] }) {
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  // The whole section takes on the color of the album on stage, and changes as you scroll.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 60%", "end 40%"] });
  const bg = colorStops(releases.map((r) => r.color));
  const fg = colorStops(releases.map((r) => r.ink));
  const background = useTransform(scrollYProgress, bg.input, bg.output);
  const color = useTransform(scrollYProgress, fg.input, fg.output);

  return (
    <motion.section
      ref={sectionRef}
      id="drops"
      aria-labelledby="drops-title"
      className="py-[100px]"
      style={
        reduce
          ? ({
              backgroundColor: releases[0].color,
              color: releases[0].ink,
              "--section-bg": releases[0].color,
              "--section-ink": releases[0].ink,
            } as never)
          : ({ backgroundColor: background, color, "--section-bg": background, "--section-ink": color } as never)
      }
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-[20px]">
          <h2 id="drops-title" className="type-display max-w-[11ch]">
            Lo que suena esta semana
          </h2>
          <p className="max-w-[34ch] text-caption opacity-75">
            Tres discos seleccionados por la redacción. El escenario toma el color de cada portada al bajar.
          </p>
        </div>
        <div className="mt-[100px] flex flex-col gap-[145px]">
          {releases.map((release, i) => (
            <Showcase
              key={release.slug}
              release={release}
              index={i}
              total={releases.length}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
