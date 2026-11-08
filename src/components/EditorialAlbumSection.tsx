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
import { spotifySearch, type Release } from "@/content/releases";
import { OutlinedArrowLink } from "./OutlinedArrowLink";

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

function Showcase({ release, flip }: { release: Release; flip: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);

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
      </motion.div>

      <motion.div
        className={`md:col-span-5 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}
        variants={column}
        initial={reduce ? "shown" : "hidden"}
        whileInView="shown"
        viewport={{ once: true, margin: "-120px" }}
      >
        <motion.p variants={rise} className="text-subheading opacity-70">
          {kickerFor[release.format]}
        </motion.p>
        <motion.h3 variants={rise} className="mt-[28px] text-heading-lg font-normal">
          {release.title}
        </motion.h3>
        <motion.p variants={rise} className="mt-[10px] text-subheading">
          {release.artist}
        </motion.p>
        <motion.p variants={rise} className="mt-[23px] max-w-[46ch] text-body opacity-80">
          {release.blurb}
        </motion.p>
        <motion.p variants={rise} className="mt-[18px] text-caption opacity-70">
          {release.genre} · {release.year}
        </motion.p>
        <motion.div variants={rise} className="mt-[44px] flex items-center gap-[28px]">
          <OutlinedArrowLink href={spotifySearch(release)} label={`Escuchar ${release.title} en Spotify`} tone="current" external />
          <Link href={`/album/${release.slug}`} className="ghost-action ghost-action--current">
            Ver canciones
          </Link>
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
        <h2 id="drops-title" className="type-display max-w-[11ch]">
          Lo que suena esta semana
        </h2>
        <div className="mt-[100px] flex flex-col gap-[145px]">
          {releases.map((release, i) => (
            <Showcase key={release.slug} release={release} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
