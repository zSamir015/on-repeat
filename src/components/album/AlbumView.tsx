"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { leadSingle, spotifySearch, type Release } from "@/content/releases";
import { OutlinedArrowLink } from "../OutlinedArrowLink";
import { PlayIcon } from "../player/PlayIcon";
import { usePlayer, type Playable } from "../player/PlayerProvider";
import { SiteMenu } from "../SiteMenu";
import { Logo } from "../brand/Logo";

type Track = { n: number; name: string; ms: number; preview: string | null };

const easeOut = [0.23, 1, 0.32, 1] as const;

const duration = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

/** Three bars bouncing at different rates: the row that is sounding. */
function Equalizer() {
  return (
    <span className="flex h-[14px] items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="eq-bar block w-[3px] bg-current" style={{ animationDelay: `${i * -0.22}s` }} />
      ))}
    </span>
  );
}

export function AlbumView({
  release,
  tracks,
  released,
  copyright,
  next,
}: {
  release: Release;
  tracks: Track[];
  released: string;
  copyright: string | null;
  next: Release;
}) {
  const reduce = useReducedMotion() ?? false;
  const player = usePlayer();
  const lead = leadSingle(release);
  const leadSounding = player.isPlaying(lead.id);
  const minutes = Math.round(tracks.reduce((a, t) => a + t.ms, 0) / 60000);

  const asPlayable = (t: Track): Playable | null =>
    t.preview
      ? { ...lead, id: `${release.slug}-${t.n}`, track: t.name, preview: t.preview }
      : null;

  return (
    <div className="min-h-svh" style={{ backgroundColor: release.color, color: release.ink }}>
      <header className="shell flex h-[72px] items-center justify-between">
        <Link href="/" aria-label="On Repeat, inicio">
          <Logo height={26} accent="currentColor" />
        </Link>
        <SiteMenu tone="inherit" />
      </header>

      <main className="shell pt-[45px] pb-[145px]">
        <section className="grid gap-[45px] md:grid-cols-12 md:gap-[25px]">
          <div className="md:col-span-6">
            <ViewTransition name={`cover-${release.slug}`} share="morph" default="none">
              <div className="relative aspect-square overflow-hidden bg-obsidian">
                <Image
                  src={release.cover}
                  alt={`Portada de ${release.title}, ${release.artist}`}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </ViewTransition>
          </div>

          <motion.div
            className="flex flex-col md:col-span-5 md:col-start-8"
            initial={reduce ? false : "out"}
            animate="in"
            variants={{ in: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
          >
            <motion.p variants={rise} className="text-subheading opacity-70">
              {release.format === "Album" ? "Álbum" : release.format}, {longDate(released)}
            </motion.p>
            <ViewTransition name={`title-${release.slug}`} share="morph" default="none">
              <h1 className="type-display-xl mt-[28px]">{release.title}</h1>
            </ViewTransition>
            <motion.p variants={rise} className="mt-[23px] text-heading-sm font-light">
              {release.artist}
            </motion.p>
            <motion.p variants={rise} className="mt-[18px] max-w-[46ch] text-body opacity-80">
              {release.blurb}
            </motion.p>
            <motion.p variants={rise} className="mt-[10px] text-caption opacity-70">
              {tracks.length} canciones, {minutes} min
            </motion.p>

            <motion.div variants={rise} className="mt-[44px] flex flex-wrap items-center gap-[28px]">
              <button
                type="button"
                onClick={() => player.toggle(lead)}
                className="flex h-[56px] items-center gap-[12px] px-[22px] transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96]"
                style={{ backgroundColor: release.ink, color: release.color }}
                aria-label={leadSounding ? `Pausar ${release.track}` : `Escuchar ${release.track}`}
              >
                <PlayIcon playing={leadSounding} />
                <span className="text-[14px] font-medium">{leadSounding ? "Pausar" : `Escuchar ${release.track}`}</span>
              </button>
              <OutlinedArrowLink href={spotifySearch(release)} label={`Abrir ${release.title} en Spotify`} tone="current" external />
            </motion.div>
          </motion.div>
        </section>

        <section aria-labelledby="tracklist-title" className="mt-[145px]">
          <h2 id="tracklist-title" className="type-display">
            Canciones
          </h2>
          <ol className="mt-[45px] border-t border-current">
            {tracks.map((t, i) => {
              const item = asPlayable(t);
              const on = item ? player.current?.id === item.id : false;
              const sounding = item ? player.isPlaying(item.id) : false;
              return (
                <motion.li
                  key={`${t.n}-${t.name}`}
                  className="border-b border-current/25"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, ease: easeOut, delay: Math.min(i, 8) * 0.03 }}
                >
                  <button
                    type="button"
                    disabled={!item}
                    onClick={() => item && player.toggle(item)}
                    aria-label={sounding ? `Pausar ${t.name}` : `Escuchar ${t.name}`}
                    aria-pressed={on}
                    className="group grid w-full grid-cols-[44px_1fr_auto] items-center gap-[18px] py-[18px] text-left disabled:opacity-50"
                  >
                    <span className="grid h-[20px] place-items-start text-[14px] tabular-nums opacity-70">
                      {sounding ? (
                        <Equalizer />
                      ) : (
                        <>
                          <span className="group-hover:hidden">{t.n}</span>
                          <span className="hidden group-hover:block">
                            <PlayIcon playing={false} size={14} />
                          </span>
                        </>
                      )}
                    </span>
                    <span className={`text-subheading transition-transform duration-300 ease-[var(--ease-out)] md:text-heading-sm md:group-hover:translate-x-[10px] ${on ? "font-medium" : "font-light"}`}>
                      {t.name}
                    </span>
                    <span className="text-[14px] tabular-nums opacity-70">{duration(t.ms)}</span>
                  </button>
                </motion.li>
              );
            })}
          </ol>
          {copyright && <p className="mt-[20px] text-caption opacity-60">{copyright}</p>}
        </section>

        <Link
          href={`/album/${next.slug}`}
          className="group mt-[145px] grid grid-cols-[96px_1fr] items-center gap-[25px] border-t border-current pt-[28px] no-underline sm:grid-cols-[140px_1fr]"
        >
          <span className="relative block aspect-square overflow-hidden">
            <Image src={next.cover} alt="" fill sizes="140px" className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.05]" />
          </span>
          <span>
            <span className="block text-subheading opacity-70">Siguiente álbum</span>
            <span className="type-display mt-[8px] block transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-[12px]">
              {next.title}
            </span>
          </span>
        </Link>
      </main>
    </div>
  );
}

const rise = {
  out: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.7, bounce: 0.15 } },
};
