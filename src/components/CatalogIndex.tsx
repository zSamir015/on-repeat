"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, ViewTransition, type PointerEvent } from "react";
import { leadSingle, type Release } from "@/content/releases";
import { PlayIcon } from "./player/PlayIcon";
import { usePlayer } from "./player/PlayerProvider";

const PREVIEW = 280;
const ALL = "Todo";
const easeOut = [0.23, 1, 0.32, 1] as const;

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const subscribeFine = (cb: () => void) => {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * The catalog as a typographic index. Filter by genre or search by name; hovering a row floods
 * the section with that album's color and a floating cover trails the cursor. Rows open the album
 * page (the title morphs into its headline); the square on the right plays the lead single.
 */
export function CatalogIndex({ releases }: { releases: Release[] }) {
  const reduce = useReducedMotion() ?? false;
  const player = usePlayer();
  const [hovered, setHovered] = useState<Release | null>(null);
  const [shown, setShown] = useState<Release | null>(null);
  const [genre, setGenre] = useState(ALL);
  const [query, setQuery] = useState("");
  const finePointer = useSyncExternalStore(
    subscribeFine,
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false
  );

  const genres = useMemo(() => [ALL, ...Array.from(new Set(releases.map((r) => r.genre)))], [releases]);
  const visible = useMemo(() => {
    const q = norm(query.trim());
    return releases.filter(
      (r) => (genre === ALL || r.genre === genre) && (!q || norm(`${r.title} ${r.artist}`).includes(q))
    );
  }, [releases, genre, query]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 });

  function onMove(e: PointerEvent) {
    x.set(e.clientX + 28);
    y.set(e.clientY - PREVIEW / 2);
  }

  function hover(release: Release | null) {
    setHovered(release);
    if (release) setShown(release);
  }

  const showPreview = finePointer && hovered !== null;

  return (
    // The section floods with the hovered album's color, then drains back to paper.
    <motion.section
      id="catalogo"
      aria-labelledby="catalogo-title"
      className="scroll-mt-[58px] pb-[100px]"
      initial={false}
      animate={{ backgroundColor: hovered?.color ?? "#ffffff", color: hovered?.ink ?? "#000000" }}
      transition={{ duration: reduce ? 0 : 0.45, ease: easeOut }}
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-[20px] pt-[100px]">
          <h2 id="catalogo-title" className="type-display">
            Catálogo
          </h2>
          <p className="text-caption opacity-60" aria-live="polite">
            {visible.length === releases.length
              ? `${releases.length} lanzamientos`
              : `${visible.length} de ${releases.length} lanzamientos`}
          </p>
        </div>

        {/* Filters */}
        <div className="mt-[45px] flex flex-col gap-[20px] md:flex-row md:items-end md:justify-between">
          <div role="group" aria-label="Filtrar por género" className="-mx-[var(--gutter)] flex gap-[8px] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            {genres.map((g) => {
              const on = g === genre;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGenre(g)}
                  className="relative h-[36px] shrink-0 border border-current px-[14px] text-[14px] whitespace-nowrap"
                >
                  {on && (
                    <motion.span
                      layoutId="genre-pill"
                      className="absolute inset-0 bg-current"
                      transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                    />
                  )}
                  <span className={`relative transition-colors duration-200 ${on ? "text-paper mix-blend-difference" : ""}`}>{g}</span>
                </button>
              );
            })}
          </div>
          <label className="block md:w-[320px]">
            <span className="sr-only">Buscar por artista o álbum</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca un artista o álbum"
              className="h-[44px] w-full border-b border-current bg-transparent text-subheading placeholder:text-current placeholder:opacity-50 focus:outline-none focus-visible:border-b-2"
            />
          </label>
        </div>

        <ul className="mt-[28px]" onPointerMove={onMove} onPointerLeave={() => hover(null)}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((release, i) => {
              const sounding = player.isPlaying(release.slug);
              return (
                <motion.li
                  key={release.slug}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.2, ease: easeOut } }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ type: "spring", duration: 0.6, bounce: 0.12, delay: Math.min(i, 6) * 0.04 }}
                  className="flex items-center gap-[18px] border-b border-current/20 first:border-t first:border-t-current"
                  onPointerEnter={() => hover(release)}
                >
                  <Link
                    href={`/album/${release.slug}`}
                    onFocus={() => hover(release)}
                    onBlur={() => hover(null)}
                    className="group grid min-w-0 flex-1 grid-cols-[56px_1fr] items-center gap-x-[18px] gap-y-1 py-[18px] text-inherit no-underline md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,2fr)_6rem] md:items-baseline md:py-[23px]"
                  >
                    <Image
                      src={release.cover}
                      alt=""
                      width={56}
                      height={56}
                      className="row-span-2 size-[56px] object-cover md:hidden"
                    />
                    <ViewTransition name={`title-${release.slug}`} share="morph" default="none">
                      <span className="block text-heading-sm font-light transition-transform duration-300 ease-[var(--ease-out)] md:text-heading-lg md:group-hover:translate-x-[18px]">
                        {release.title}
                      </span>
                    </ViewTransition>
                    <span className="text-subheading opacity-60 md:opacity-100">{release.artist}</span>
                    <span className="hidden text-[14px] opacity-60 md:block">{release.genre}</span>
                    <span className="hidden text-right text-[14px] opacity-60 tabular-nums md:block">{release.year}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => player.toggle(leadSingle(release))}
                    aria-label={sounding ? `Pausar ${release.track}` : `Escuchar ${release.track}, de ${release.artist}`}
                    className="grid size-[44px] shrink-0 place-items-center border border-current/40 transition-[transform,border-color] duration-150 ease-[var(--ease-out)] hover:border-current active:scale-[0.94]"
                  >
                    <PlayIcon playing={sounding} size={14} />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {visible.length === 0 && (
          <div className="py-[45px]">
            <p className="text-heading-sm font-light">Nada con “{query || genre}”.</p>
            <p className="mt-[8px] text-body opacity-70">Prueba con otro artista o vuelve a ver todo el catálogo.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGenre(ALL);
              }}
              className="ghost-action ghost-action--current mt-[20px]"
            >
              Ver todo
            </button>
          </div>
        )}
      </div>

      {/* Floating cover preview. Hidden from assistive tech: the row already names the release.
          Every cover stays mounted so switching rows crossfades instead of loading. */}
      {finePointer && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40"
          style={{ x: sx, y: sy, width: PREVIEW, height: PREVIEW }}
        >
          <motion.div
            className="relative h-full w-full overflow-hidden bg-obsidian"
            initial={false}
            animate={
              showPreview
                ? { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }
                : { opacity: 0, scale: 0.96, clipPath: "inset(50% 0% 50% 0%)" }
            }
            transition={{ duration: 0.25, ease: easeOut }}
          >
            {releases.map((r) => (
              <motion.div
                key={r.slug}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: shown?.slug === r.slug ? 1 : 0, scale: shown?.slug === r.slug ? 1 : 1.06 }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <Image src={r.cover} alt="" fill sizes={`${PREVIEW}px`} className="object-cover" />
              </motion.div>
            ))}
            {/* Frame in the album's ink, drawn inside the box so the clip-path reveal can't cut it.
                Without it a cover the same color as the flooded section (BRAT on lime) dissolves. */}
            <span
              className="absolute inset-0 border-2 transition-colors duration-300"
              style={{ borderColor: shown?.ink ?? "#000000" }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
}
