"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { spotifySearch } from "@/content/releases";
import { PlayIcon } from "./PlayIcon";
import { usePlayer } from "./PlayerProvider";

const easeOut = [0.23, 1, 0.32, 1] as const;

/** Bar pinned to the bottom once something plays; keeps the preview going while you scroll. */
export function MiniPlayer() {
  const { current, playing, progress, toggle, close } = usePlayer();

  return (
    <>
      {/* In-flow spacer so the fixed bar never covers the end of the page */}
      {current && <div aria-hidden className="h-[72px]" />}
      <AnimatePresence>
        {current && (
          <motion.div
            key="mini-player"
            role="region"
            aria-label="Reproductor"
            className="on-dark fixed inset-x-0 bottom-0 z-50 text-paper"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: easeOut }}
            style={{ backgroundColor: current.color, color: current.ink }}
          >
            {/* Progress along the top edge */}
            <motion.div
              className="absolute inset-x-0 top-0 h-[3px] origin-left"
              style={{ scaleX: progress, backgroundColor: current.ink }}
            />
            <div className="shell flex h-[72px] items-center gap-[18px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.id}
                  className="flex min-w-0 flex-1 items-center gap-[18px]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <Image
                    src={current.cover}
                    alt=""
                    width={48}
                    height={48}
                    className="size-[48px] shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[16px] leading-tight">
                      {current.track}
                    </p>
                    <p className="truncate text-[14px] opacity-70">
                      {current.artist}, {current.album}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => toggle(current)}
                aria-label={playing ? "Pausar" : "Reproducir"}
                className="grid size-[44px] shrink-0 place-items-center border border-current transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.94]"
              >
                <PlayIcon playing={playing} />
              </button>
              <a
                href={spotifySearch({
                  artist: current.artist,
                  title: current.album,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-[14px] underline-offset-4 hover:underline sm:inline"
              >
                Abrir en Spotify
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar reproductor"
                className="grid size-[44px] shrink-0 place-items-center"
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
