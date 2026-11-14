"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { releases, spotifySearch } from "@/content/releases";
import { PlayIcon } from "./PlayIcon";
import { usePlayer } from "./PlayerProvider";

const easeOut = [0.23, 1, 0.32, 1] as const;

const fmtTime = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Bar pinned to the bottom once something plays; keeps the preview going while you scroll. */
export function MiniPlayer() {
  const {
    current,
    queue,
    playing,
    repeat,
    muted,
    elapsed,
    duration,
    progress,
    toggle,
    next,
    prev,
    seek,
    toggleRepeat,
    toggleMute,
    close,
  } = usePlayer();

  const scrubRef = useRef<HTMLDivElement>(null);

  const seekFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const bar = scrubRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return;
    seek((e.clientX - rect.left) / rect.width);
  };

  const albumSlug =
    current?.albumSlug ??
    releases.find((r) => r.slug === current?.id || r.title === current?.album)?.slug;

  return (
    <>
      {/* In-flow spacer so the fixed bar never covers the end of the page */}
      {current && <div aria-hidden className="h-[76px]" />}
      <AnimatePresence>
        {current && (
          <motion.div
            key="mini-player"
            role="region"
            aria-label="Reproductor"
            className="on-dark fixed inset-x-0 bottom-0 z-50 border-t border-current/20 text-paper select-none"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: easeOut }}
            style={{ backgroundColor: current.color, color: current.ink }}
          >
            {/* Interactive scrub bar along the top edge */}
            <div
              ref={scrubRef}
              role="slider"
              tabIndex={0}
              aria-label="Posición de reproducción"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(elapsed)}
              aria-valuetext={`${fmtTime(elapsed)} de ${fmtTime(duration)}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                seekFromPointer(e);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) seekFromPointer(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  seek((elapsed + 3) / (duration || 30));
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  seek((elapsed - 3) / (duration || 30));
                }
              }}
              className="group/scrub absolute inset-x-0 -top-[6px] z-20 flex h-[12px] cursor-pointer items-end"
            >
              <div className="relative h-[3px] w-full bg-current/20 transition-[height] duration-150 group-hover/scrub:h-[6px]">
                <motion.div
                  className="absolute inset-y-0 left-0 origin-left"
                  style={{ scaleX: progress, width: "100%", backgroundColor: current.ink }}
                />
              </div>
            </div>

            <div className="shell flex h-[76px] items-center gap-[12px] sm:gap-[18px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.id}
                  className="flex min-w-0 flex-1 items-center gap-[14px] sm:gap-[18px]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  {albumSlug ? (
                    <Link
                      href={`/album/${albumSlug}`}
                      aria-label={`Ver álbum ${current.album}`}
                      className="group/cover relative block size-[48px] shrink-0 overflow-hidden"
                    >
                      <Image
                        src={current.cover}
                        alt=""
                        width={48}
                        height={48}
                        className="size-[48px] object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover/cover:scale-[1.06]"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={current.cover}
                      alt=""
                      width={48}
                      height={48}
                      className="size-[48px] shrink-0 object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-[8px]">
                      {playing && (
                        <span className="flex h-[12px] shrink-0 items-end gap-[2px]" aria-hidden>
                          <span className="eq-bar block w-[2px] bg-current" />
                          <span className="eq-bar block w-[2px] bg-current" style={{ animationDelay: "-0.25s" }} />
                          <span className="eq-bar block w-[2px] bg-current" style={{ animationDelay: "-0.5s" }} />
                        </span>
                      )}
                      {albumSlug ? (
                        <Link
                          href={`/album/${albumSlug}`}
                          className="truncate text-[16px] font-medium leading-tight no-underline hover:underline"
                        >
                          {current.track}
                        </Link>
                      ) : (
                        <p className="truncate text-[16px] font-medium leading-tight">{current.track}</p>
                      )}
                    </div>
                    <p className="mt-[2px] truncate text-[13px] opacity-75">
                      {current.artist} ·{" "}
                      {albumSlug ? (
                        <Link href={`/album/${albumSlug}`} className="no-underline hover:underline">
                          {current.album}
                        </Link>
                      ) : (
                        current.album
                      )}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Timecode */}
              <div
                className="hidden text-[13px] tabular-nums opacity-75 md:block"
                aria-label="Tiempo transcurrido"
              >
                {fmtTime(elapsed)} <span className="opacity-50">/</span> {fmtTime(duration)}
              </div>

              {/* Transport controls */}
              <div className="flex items-center gap-[6px]">
                {queue.length > 1 && (
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Anterior"
                    title="Anterior"
                    className="hidden size-[40px] shrink-0 place-items-center border border-current/35 transition-colors hover:border-current active:scale-[0.94] sm:grid"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <rect x="2" y="3" width="2" height="10" />
                      <path d="M13.5 3 L5.5 8 L13.5 13 Z" />
                    </svg>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggle(current)}
                  aria-label={playing ? "Pausar" : "Reproducir"}
                  title={playing ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
                  className="grid size-[44px] shrink-0 place-items-center border border-current transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.94]"
                  style={{ backgroundColor: current.ink, color: current.color }}
                >
                  <PlayIcon playing={playing} />
                </button>

                {queue.length > 1 && (
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Siguiente"
                    title="Siguiente"
                    className="grid size-[40px] shrink-0 place-items-center border border-current/35 transition-colors hover:border-current active:scale-[0.94]"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M2.5 3 L10.5 8 L2.5 13 Z" />
                      <rect x="12" y="3" width="2" height="10" />
                    </svg>
                  </button>
                )}

                {/* Signature On Repeat toggle (‖: :‖) */}
                <button
                  type="button"
                  onClick={toggleRepeat}
                  aria-pressed={repeat}
                  aria-label={repeat ? "Desactivar repetición en bucle" : "Repetir canción en bucle"}
                  title="On Repeat — Repetir en bucle (R)"
                  className="hidden h-[40px] shrink-0 items-center px-[10px] text-[12px] font-medium tracking-wider border border-current/35 transition-colors hover:border-current active:scale-[0.94] sm:flex"
                  style={
                    repeat
                      ? { backgroundColor: current.ink, color: current.color, borderColor: current.ink }
                      : undefined
                  }
                >
                  <span aria-hidden>‖: :‖</span>
                </button>

                {/* Mute toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={muted}
                  aria-label={muted ? "Activar sonido" : "Silenciar"}
                  title={muted ? "Activar sonido (M)" : "Silenciar (M)"}
                  className="hidden size-[40px] shrink-0 place-items-center border border-current/35 transition-colors hover:border-current active:scale-[0.94] lg:grid"
                >
                  {muted ? (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <path d="M2 6H5L9 2.5V13.5L5 10H2V6Z" fill="currentColor" stroke="none" />
                      <path d="M11.5 5.5L15 10.5M15 5.5L11.5 10.5" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <path d="M2 6H5L9 2.5V13.5L5 10H2V6Z" fill="currentColor" stroke="none" />
                      <path d="M11.5 5C12.6 6 12.6 10 11.5 11" />
                      <path d="M13.5 3.2C15.3 5.2 15.3 10.8 13.5 12.8" />
                    </svg>
                  )}
                </button>
              </div>

              <a
                href={spotifySearch({
                  artist: current.artist,
                  title: current.album,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-[13px] underline-offset-4 hover:underline xl:inline"
              >
                Spotify ↗
              </a>

              <button
                type="button"
                onClick={close}
                aria-label="Cerrar reproductor"
                title="Cerrar reproductor"
                className="grid size-[40px] shrink-0 place-items-center opacity-75 transition-opacity hover:opacity-100"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M1 1 L13 13 M13 1 L1 13" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
