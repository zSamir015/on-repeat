"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, ViewTransition } from "react";
import { leadSingle, releases, spotifySearch, type Release } from "@/content/releases";
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
  const [copied, setCopied] = useState(false);

  const lead = leadSingle(release);
  const minutes = Math.round(tracks.reduce((a, t) => a + t.ms, 0) / 60000);

  const relIdx = releases.findIndex((r) => r.slug === release.slug);
  const prev = releases[(relIdx - 1 + releases.length) % releases.length];

  const asPlayable = useMemo(
    () => (t: Track): Playable | null =>
      t.preview
        ? { ...lead, id: `${release.slug}-${t.n}`, albumSlug: release.slug, track: t.name, preview: t.preview }
        : null,
    [lead, release.slug]
  );

  const albumQueue = useMemo(
    () => tracks.map(asPlayable).filter((x): x is Playable => x !== null),
    [tracks, asPlayable]
  );

  const currentId = player.current?.id;
  const activeAlbumTrack = useMemo(
    () => albumQueue.find((item) => item.id === currentId) ?? (currentId === lead.id ? lead : null),
    [albumQueue, currentId, lead]
  );

  const albumSounding = Boolean(activeAlbumTrack && player.playing);
  const primaryTarget = activeAlbumTrack ?? albumQueue.find((t) => t.track.toLowerCase() === release.track.toLowerCase()) ?? albumQueue[0] ?? lead;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: `${release.title} — ${release.artist}`, text: release.blurb, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore user cancellation
    }
  };

  return (
    <div
      className="min-h-svh"
      style={
        {
          backgroundColor: release.color,
          color: release.ink,
          "--section-bg": release.color,
          "--section-ink": release.ink,
        } as never
      }
    >
      <header className="shell flex h-[72px] items-center justify-between border-b border-current/15">
        <div className="flex items-center gap-[24px]">
          <Link href="/" aria-label="On Repeat, inicio">
            <Logo height={26} accent="currentColor" />
          </Link>
          <Link
            href="/#catalogo"
            className="hidden items-center gap-[6px] border-l border-current/25 pl-[20px] text-[14px] no-underline opacity-75 transition-opacity hover:opacity-100 sm:inline-flex"
          >
            <span aria-hidden>←</span>
            <span>Catálogo</span>
          </Link>
        </div>
        <SiteMenu tone="inherit" />
      </header>

      <main className="shell pt-[45px] pb-[145px]">
        <section className="grid gap-[45px] md:grid-cols-12 md:gap-[25px]">
          <div className="md:col-span-6">
            <ViewTransition name={`cover-${release.slug}`} share="morph" default="none">
              <div className="group relative aspect-square overflow-hidden bg-obsidian">
                <Image
                  src={release.cover}
                  alt={`Portada de ${release.title}, ${release.artist}`}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                {activeAlbumTrack && (
                  <div
                    className="absolute inset-x-0 bottom-0 flex items-center justify-between px-[18px] py-[12px] text-[13px] font-medium"
                    style={{ backgroundColor: release.ink, color: release.color }}
                  >
                    <span className="flex items-center gap-[10px] truncate">
                      {albumSounding ? <Equalizer /> : <PlayIcon playing={false} size={12} />}
                      <span className="truncate">
                        {albumSounding ? "Sonando:" : "En pausa:"} {activeAlbumTrack.track}
                      </span>
                    </span>
                    <span className="ml-[12px] shrink-0 text-[11px] tracking-wider uppercase opacity-75">
                      Preview 0:30
                    </span>
                  </div>
                )}
              </div>
            </ViewTransition>
          </div>

          <motion.div
            className="flex flex-col md:col-span-5 md:col-start-8"
            initial={reduce ? false : "out"}
            animate="in"
            variants={{ in: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
          >
            <motion.div variants={rise} className="flex items-center justify-between border-b border-current/20 pb-[12px] text-[14px] opacity-75">
              <span>
                {release.format === "Album" ? "Álbum" : release.format} · {longDate(released)}
              </span>
              <span className="tabular-nums">
                {String(relIdx + 1).padStart(2, "0")} / {String(releases.length).padStart(2, "0")}
              </span>
            </motion.div>
            <ViewTransition name={`title-${release.slug}`} share="morph" default="none">
              <h1 className="type-display-xl mt-[28px]">{release.title}</h1>
            </ViewTransition>
            <motion.p variants={rise} className="mt-[23px] text-heading-sm font-light">
              {release.artist}
            </motion.p>
            <motion.p variants={rise} className="mt-[18px] max-w-[46ch] text-body opacity-80">
              {release.blurb}
            </motion.p>
            <motion.p variants={rise} className="mt-[12px] text-caption opacity-70">
              {release.genre} · {tracks.length} canciones · {minutes} min
            </motion.p>

            <motion.div variants={rise} className="mt-[44px] flex flex-wrap items-center gap-[18px]">
              <button
                type="button"
                onClick={() => player.toggle(primaryTarget, albumQueue)}
                className="flex h-[56px] items-center gap-[12px] px-[22px] transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96]"
                style={{ backgroundColor: release.ink, color: release.color }}
                aria-label={albumSounding ? `Pausar ${primaryTarget.track}` : `Escuchar ${primaryTarget.track}`}
              >
                <PlayIcon playing={albumSounding} />
                <span className="text-[14px] font-medium">
                  {albumSounding ? "Pausar" : `Escuchar ${primaryTarget.track}`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="ghost-action ghost-action--current h-[56px] px-[18px]"
              >
                {copied ? "Enlace copiado ✓" : "Compartir"}
              </button>

              <OutlinedArrowLink href={spotifySearch(release)} label={`Abrir ${release.title} en Spotify`} tone="current" external />
            </motion.div>
          </motion.div>
        </section>

        <section aria-labelledby="tracklist-title" className="mt-[145px]">
          <div className="flex flex-wrap items-end justify-between gap-[16px]">
            <h2 id="tracklist-title" className="type-display">
              Canciones
            </h2>
            <p className="text-caption opacity-70">
              Haz clic en cualquier canción para escuchar su preview de 30 s en continuo.
            </p>
          </div>
          <ol className="mt-[45px] border-t border-current">
            {tracks.map((t, i) => {
              const item = asPlayable(t);
              const on = item ? player.current?.id === item.id : false;
              const sounding = item ? player.isPlaying(item.id) : false;
              const isLead = t.name.toLowerCase() === release.track.toLowerCase();
              return (
                <motion.li
                  key={`${t.n}-${t.name}`}
                  className={`relative border-b border-current/25 transition-colors ${on ? "bg-current/[0.06]" : ""}`}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, ease: easeOut, delay: Math.min(i, 8) * 0.03 }}
                >
                  <button
                    type="button"
                    disabled={!item}
                    onClick={() => item && player.toggle(item, albumQueue)}
                    aria-label={sounding ? `Pausar ${t.name}` : `Escuchar ${t.name}`}
                    aria-pressed={on}
                    className="group grid w-full grid-cols-[44px_1fr_auto] items-center gap-[18px] px-[8px] py-[18px] text-left disabled:opacity-50 sm:px-[12px]"
                  >
                    <span className="grid h-[20px] place-items-start text-[14px] tabular-nums opacity-70">
                      {sounding ? (
                        <Equalizer />
                      ) : (
                        <>
                          <span className="group-hover:hidden">{String(t.n).padStart(2, "0")}</span>
                          <span className="hidden group-hover:block">
                            <PlayIcon playing={false} size={14} />
                          </span>
                        </>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-wrap items-center gap-x-[12px] gap-y-[4px]">
                      <span
                        className={`truncate text-subheading transition-transform duration-300 ease-[var(--ease-out)] md:text-heading-sm md:group-hover:translate-x-[10px] ${
                          on ? "font-medium" : "font-light"
                        }`}
                      >
                        {t.name}
                      </span>
                      {isLead && (
                        <span className="border border-current/45 px-[6px] py-[1px] text-[10px] font-medium tracking-wider uppercase opacity-80 md:group-hover:translate-x-[10px] transition-transform duration-300 ease-[var(--ease-out)]">
                          SINGLE
                        </span>
                      )}
                    </span>
                    <span className="text-[14px] tabular-nums opacity-70">{duration(t.ms)}</span>
                  </button>
                  {on && (
                    <motion.span
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-current"
                      style={{ scaleX: player.progress }}
                    />
                  )}
                </motion.li>
              );
            })}
          </ol>
          {copyright && <p className="mt-[20px] text-caption opacity-60">{copyright}</p>}
        </section>

        {/* Prev / Next Album Navigation */}
        <nav
          aria-label="Otros lanzamientos del catálogo"
          className="mt-[145px] grid gap-[25px] border-t border-current pt-[28px] md:grid-cols-2"
        >
          <Link
            href={`/album/${prev.slug}`}
            className="group grid grid-cols-[88px_1fr] items-center gap-[20px] border border-current/20 p-[16px] no-underline transition-colors hover:border-current sm:grid-cols-[120px_1fr]"
          >
            <span className="relative block aspect-square overflow-hidden bg-obsidian">
              <Image
                src={prev.cover}
                alt=""
                fill
                sizes="120px"
                className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.05]"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] tracking-wider uppercase opacity-65">← Anterior</span>
              <span className="mt-[6px] block truncate text-heading font-light transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-[6px]">
                {prev.title}
              </span>
              <span className="mt-[2px] block truncate text-[14px] opacity-75">{prev.artist}</span>
            </span>
          </Link>

          <Link
            href={`/album/${next.slug}`}
            className="group grid grid-cols-[88px_1fr] items-center gap-[20px] border border-current/20 p-[16px] no-underline transition-colors hover:border-current sm:grid-cols-[120px_1fr]"
          >
            <span className="relative block aspect-square overflow-hidden bg-obsidian">
              <Image
                src={next.cover}
                alt=""
                fill
                sizes="120px"
                className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.05]"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] tracking-wider uppercase opacity-65">Siguiente álbum →</span>
              <span className="mt-[6px] block truncate text-heading font-light transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-[6px]">
                {next.title}
              </span>
              <span className="mt-[2px] block truncate text-[14px] opacity-75">{next.artist}</span>
            </span>
          </Link>
        </nav>
      </main>
    </div>
  );
}

const rise = {
  out: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { type: "spring" as const, duration: 0.7, bounce: 0.15 } },
};
