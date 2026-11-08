"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { leadSingle, spotifySearch, type Release } from "@/content/releases";
import { OutlinedArrowLink } from "./OutlinedArrowLink";
import { PlayIcon } from "./player/PlayIcon";
import { usePlayer } from "./player/PlayerProvider";

const CYCLE_MS = 4200;
const easeOut = [0.23, 1, 0.32, 1] as const;

/**
 * "En rotación": a record player for the catalog. The active sleeve sits on the left and its
 * record slides out and spins. Left alone it changes record on a timer (the bar under the active
 * thumbnail shows when); pointer or keyboard on a thumbnail takes over. Pressing play drops the
 * tonearm and the record only spins while its preview is actually sounding.
 */
export function RecordShelf({ releases }: { releases: Release[] }) {
  const reduce = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLElement>(null);
  const inView = useInView(stageRef, { margin: "-25% 0px" });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const player = usePlayer();
  const running = !reduce && !held && inView && !player.playing;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % releases.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [running, active, releases.length]);

  const r = releases[active];
  const sounding = player.isPlaying(r.slug);

  return (
    <section
      ref={stageRef}
      aria-labelledby="rotacion-title"
      className="on-dark overflow-hidden bg-obsidian py-[100px] text-paper"
    >
      <div className="shell grid items-center gap-[45px] md:grid-cols-12 md:gap-[25px]">
        {/* Player */}
        <div className="relative md:col-span-7">
          <div className="relative w-[64%] md:w-[62%]">
            <div className="aspect-square" />
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div key={r.slug} className="absolute inset-0" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                {/* Record */}
                <motion.div
                  aria-hidden
                  className="absolute inset-[3%]"
                  initial={reduce ? { x: "52%" } : { x: "0%" }}
                  animate={{ x: "52%" }}
                  transition={{ type: "spring", duration: 0.9, bounce: 0.18, delay: reduce ? 0 : 0.35 }}
                >
                  <div
                    className={`vinyl h-full w-full ${sounding && !reduce ? "vinyl--spinning" : ""}`}
                    style={{ clipPath: "circle(50%)" }}
                  >
                    <div className="absolute inset-[34%] overflow-hidden" style={{ clipPath: "circle(50%)" }}>
                      <Image src={r.cover} alt="" fill sizes="160px" className="object-cover" />
                    </div>
                    <div
                      className="absolute top-1/2 left-1/2 size-[3%] -translate-x-1/2 -translate-y-1/2 bg-obsidian"
                      style={{ clipPath: "circle(50%)" }}
                    />
                  </div>
                </motion.div>

                {/* Sleeve */}
                <motion.div
                  className="absolute inset-0 overflow-hidden bg-obsidian"
                  initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
                >
                  <Image
                    src={r.cover}
                    alt={`Portada de ${r.title}, ${r.artist}`}
                    fill
                    sizes="(min-width: 768px) 32vw, 64vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Tonearm: rests off the record, swings onto it while the preview plays */}
            <motion.svg
              aria-hidden
              viewBox="0 0 100 120"
              className="pointer-events-none absolute top-[-2.5%] left-[109%] w-[45%] text-paper"
              style={{ transformOrigin: "80% 8.3%" }}
              initial={false}
              animate={{ rotate: sounding ? 0 : -24 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.15 }}
            >
              <circle cx="80" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="80" cy="10" r="2.5" fill="currentColor" />
              <path d="M80 10 L80 48 L46 98" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
              <rect x="38" y="96" width="14" height="9" fill="currentColor" transform="rotate(-34 45 100)" />
            </motion.svg>

            {/* Play control, sits on the sleeve's corner */}
            <button
              type="button"
              onClick={() => player.toggle(leadSingle(r))}
              aria-label={sounding ? `Pausar ${r.track}` : `Escuchar ${r.track}, de ${r.artist}`}
              className="absolute bottom-0 left-0 z-10 flex h-[56px] items-center gap-[12px] bg-paper px-[18px] text-obsidian transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96]"
            >
              <PlayIcon playing={sounding} />
              <span className="text-[14px] font-medium">{sounding ? "Pausar" : "Escuchar preview"}</span>
            </button>
          </div>
        </div>

        {/* Info + selector */}
        <div className="md:col-span-5">
          <h2 id="rotacion-title" className="kicker">
            EN ROTACIÓN
          </h2>

          <div className="mt-[28px] min-h-[176px]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={r.slug}
                initial={reduce ? false : "out"}
                animate="in"
                exit="gone"
                variants={{ in: { transition: { staggerChildren: 0.06 } } }}
              >
                <motion.p variants={line} className="type-display">
                  <Link href={`/album/${r.slug}`} className="no-underline hover:underline">
                    {r.title}
                  </Link>
                </motion.p>
                <motion.p variants={line} className="mt-[18px] text-subheading">
                  {r.artist}
                </motion.p>
                <motion.p variants={line} className="mt-[8px] text-caption text-graphite">
                  {r.genre} · {r.year} · preview: {r.track}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-[28px] text-paper">
            <OutlinedArrowLink href={spotifySearch(r)} label={`Escuchar ${r.title} en Spotify`} tone="current" external />
          </div>

          <ul
            className="mt-[44px] grid grid-cols-8 gap-[8px] md:grid-cols-4"
            onPointerLeave={() => setHeld(false)}
            aria-label="Elegir disco"
          >
            {releases.map((rel, i) => {
              const on = i === active;
              return (
                <li key={rel.slug}>
                  <button
                    type="button"
                    aria-label={`${rel.title}, ${rel.artist}`}
                    aria-pressed={on}
                    onPointerEnter={() => {
                      setHeld(true);
                      setActive(i);
                    }}
                    onFocus={() => {
                      setHeld(true);
                      setActive(i);
                    }}
                    onBlur={() => setHeld(false)}
                    onClick={() => setActive(i)}
                    className="group relative block aspect-square w-full overflow-hidden"
                  >
                    <Image src={rel.cover} alt="" fill sizes="90px" className="object-cover" />
                    <span
                      className={`absolute inset-0 bg-obsidian transition-opacity duration-300 ease-[var(--ease-out)] ${on ? "opacity-0" : "opacity-50 group-hover:opacity-20"}`}
                    />
                    {/* Countdown to the next record */}
                    {/* While a preview sounds the bar follows the audio; otherwise it counts down to the next record */}
                    {player.current?.id === rel.slug ? (
                      <motion.span
                        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-paper"
                        style={{ scaleX: player.progress }}
                      />
                    ) : (
                      on && (
                        <motion.span
                          key={`${rel.slug}-${running}`}
                          className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-paper"
                          initial={{ scaleX: running ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: running ? CYCLE_MS / 1000 : 0, ease: "linear" }}
                        />
                      )
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

const line = {
  out: { opacity: 0, y: 24 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  gone: { opacity: 0, y: -16, transition: { duration: 0.2, ease: easeOut } },
};
