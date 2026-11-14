"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, ViewTransition, type PointerEvent } from "react";
import { leadSingle, type Release } from "@/content/releases";
import { PlayIcon } from "./player/PlayIcon";
import { usePlayer } from "./player/PlayerProvider";

const PREVIEW = 260;
const ALL = "Todo";
const easeOut = [0.23, 1, 0.32, 1] as const;

type SortBy = "default" | "title" | "artist" | "year";
type ViewMode = "list" | "grid";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const subscribeFine = (cb: () => void) => {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * The catalog as a typographic index or cover gallery. Filter by genre, sort, or search by name;
 * hovering a row floods the section with that album's color and a floating cover trails the cursor.
 * Rows open the album page (the title morphs into its headline); the square on the right plays the lead single.
 */
export function CatalogIndex({ releases }: { releases: Release[] }) {
  const reduce = useReducedMotion() ?? false;
  const player = usePlayer();
  const [hovered, setHovered] = useState<Release | null>(null);
  const [shown, setShown] = useState<Release | null>(null);
  const [genre, setGenre] = useState(ALL);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const finePointer = useSyncExternalStore(
    subscribeFine,
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false
  );

  const genres = useMemo(() => [ALL, ...Array.from(new Set(releases.map((r) => r.genre)))], [releases]);

  const visible = useMemo(() => {
    const q = norm(query.trim());
    const filtered = releases.filter(
      (r) => (genre === ALL || r.genre === genre) && (!q || norm(`${r.title} ${r.artist} ${r.track}`).includes(q))
    );
    if (sortBy === "title") return [...filtered].sort((a, b) => a.title.localeCompare(b.title, "es"));
    if (sortBy === "artist") return [...filtered].sort((a, b) => a.artist.localeCompare(b.artist, "es"));
    if (sortBy === "year") return [...filtered].sort((a, b) => b.year - a.year);
    return filtered;
  }, [releases, genre, query, sortBy]);

  const visibleQueue = useMemo(() => visible.map(leadSingle), [visible]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 });

  function onMove(e: PointerEvent) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const flipLeft = e.clientX > vw * 0.6;
    const targetX = flipLeft ? e.clientX - PREVIEW - 32 : e.clientX + 28;
    const targetY = Math.max(72, Math.min(vh - PREVIEW - 88, e.clientY - PREVIEW / 2));
    x.set(targetX);
    y.set(targetY);
  }

  function hover(release: Release | null) {
    setHovered(release);
    if (release) setShown(release);
  }

  const activeBg = hovered?.color ?? "#ffffff";
  const activeInk = hovered?.ink ?? "#000000";
  const showPreview = finePointer && viewMode === "list" && hovered !== null;

  return (
    // The section floods with the hovered album's color, then drains back to paper.
    <motion.section
      id="catalogo"
      aria-labelledby="catalogo-title"
      className="scroll-mt-[58px] pb-[100px]"
      initial={false}
      animate={{ backgroundColor: activeBg, color: activeInk }}
      transition={{ duration: reduce ? 0 : 0.45, ease: easeOut }}
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-[20px] pt-[100px]">
          <div>
            <p className="text-[13px] tracking-[0.12em] uppercase opacity-60">ARCHIVO COMPLETO</p>
            <h2 id="catalogo-title" className="type-display mt-[10px]">
              Catálogo
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-[18px]">
            <p className="text-caption tabular-nums opacity-60" aria-live="polite">
              {visible.length === releases.length
                ? `${releases.length} lanzamientos`
                : `${visible.length} de ${releases.length} lanzamientos`}
            </p>

            {/* View mode toggle: Índice vs Portadas */}
            <div role="group" aria-label="Modo de vista" className="flex border border-current">
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className="h-[34px] px-[12px] text-[13px] font-medium transition-colors"
                style={
                  viewMode === "list"
                    ? { backgroundColor: activeInk, color: activeBg }
                    : undefined
                }
              >
                Índice
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "grid"}
                onClick={() => {
                  setViewMode("grid");
                  hover(null);
                }}
                className="h-[34px] border-l border-current px-[12px] text-[13px] font-medium transition-colors"
                style={
                  viewMode === "grid"
                    ? { backgroundColor: activeInk, color: activeBg }
                    : undefined
                }
              >
                Portadas
              </button>
            </div>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="mt-[45px] flex flex-col gap-[20px] lg:flex-row lg:items-end lg:justify-between">
          <div
            role="group"
            aria-label="Filtrar por género"
            className="-mx-[var(--gutter)] flex gap-[8px] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
          >
            {genres.map((g) => {
              const on = g === genre;
              const count = g === ALL ? releases.length : releases.filter((r) => r.genre === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGenre(g)}
                  className="relative flex h-[36px] shrink-0 items-center gap-[6px] border border-current px-[14px] text-[14px] whitespace-nowrap transition-colors"
                  style={
                    on
                      ? { backgroundColor: activeInk, color: activeBg }
                      : undefined
                  }
                >
                  <span>{g}</span>
                  <span className="text-[11px] tabular-nums opacity-65">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-[12px] sm:flex-row sm:items-end sm:gap-[18px]">
            {/* Sort selector */}
            <div className="flex items-center gap-[6px] text-[13px]">
              <span className="opacity-60">Orden:</span>
              {(
                [
                  { id: "default", label: "Curado" },
                  { id: "year", label: "Año" },
                  { id: "title", label: "A–Z" },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sortBy === s.id}
                  onClick={() => setSortBy(s.id)}
                  className={`px-[8px] py-[4px] underline-offset-4 ${
                    sortBy === s.id ? "font-medium underline" : "opacity-65 hover:opacity-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <label className="relative block sm:w-[290px]">
              <span className="sr-only">Buscar por artista, álbum o canción</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca artista, álbum o canción"
                className="h-[44px] w-full border-b border-current bg-transparent pr-[32px] text-subheading placeholder:text-current placeholder:opacity-50 focus:outline-none focus-visible:border-b-2"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute top-1/2 right-0 grid size-[32px] -translate-y-1/2 place-items-center opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              )}
            </label>
          </div>
        </div>

        {/* List View */}
        {viewMode === "list" ? (
          <div className="mt-[28px]">
            {/* Desktop column headers */}
            {visible.length > 0 && (
              <div
                aria-hidden
                className="hidden border-b border-current py-[10px] pr-[62px] text-[12px] tracking-[0.08em] uppercase opacity-55 md:grid md:grid-cols-[2.5rem_minmax(0,5fr)_minmax(0,4fr)_minmax(0,2fr)_5rem] md:items-baseline md:gap-x-[18px]"
              >
                <span>#</span>
                <span>Título</span>
                <span>Artista</span>
                <span>Género</span>
                <span className="text-right">Año</span>
              </div>
            )}

            <ul onPointerMove={onMove} onPointerLeave={() => hover(null)}>
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
                      className="relative flex items-center gap-[18px] border-b border-current/20 first:border-t first:border-t-current md:first:border-t-0"
                      onPointerEnter={() => hover(release)}
                    >
                      <Link
                        href={`/album/${release.slug}`}
                        onFocus={() => hover(release)}
                        onBlur={() => hover(null)}
                        className="group grid min-w-0 flex-1 grid-cols-[56px_1fr] items-center gap-x-[18px] gap-y-1 py-[18px] text-inherit no-underline md:grid-cols-[2.5rem_minmax(0,5fr)_minmax(0,4fr)_minmax(0,2fr)_5rem] md:items-baseline md:py-[23px]"
                      >
                        <Image
                          src={release.cover}
                          alt=""
                          width={56}
                          height={56}
                          className="row-span-2 size-[56px] object-cover md:hidden"
                        />
                        <span className="hidden text-[13px] tabular-nums opacity-50 md:block">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <ViewTransition name={`title-${release.slug}`} share="morph" default="none">
                          <span className="block text-heading-sm font-light transition-transform duration-300 ease-[var(--ease-out)] md:text-heading-lg md:group-hover:translate-x-[14px]">
                            {release.title}
                          </span>
                        </ViewTransition>
                        <span className="text-subheading opacity-60 md:opacity-100">{release.artist}</span>
                        <span className="hidden text-[14px] opacity-60 md:block">{release.genre}</span>
                        <span className="hidden text-right text-[14px] opacity-60 tabular-nums md:block">
                          {release.year}
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => player.toggle(leadSingle(release), visibleQueue)}
                        aria-label={
                          sounding
                            ? `Pausar ${release.track}`
                            : `Escuchar ${release.track}, de ${release.artist}`
                        }
                        className="grid size-[44px] shrink-0 place-items-center border border-current/40 transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-current active:scale-[0.94]"
                        style={sounding ? { backgroundColor: activeInk, color: activeBg, borderColor: activeInk } : undefined}
                      >
                        <PlayIcon playing={sounding} size={14} />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        ) : (
          /* Grid View ("Portadas") */
          <ul
            className="mt-[36px] grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4"
            onPointerLeave={() => hover(null)}
          >
            {visible.map((release, i) => {
              const sounding = player.isPlaying(release.slug);
              return (
                <motion.li
                  key={release.slug}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: easeOut, delay: Math.min(i, 7) * 0.04 }}
                  onPointerEnter={() => hover(release)}
                  className="group flex flex-col border border-current/25 p-[16px] transition-colors hover:border-current"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-obsidian">
                    <Link
                      href={`/album/${release.slug}`}
                      aria-label={`Ver álbum ${release.title}`}
                      className="absolute inset-0 block"
                    >
                      <Image
                        src={release.cover}
                        alt={`Portada de ${release.title}`}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                      />
                    </Link>
                    <span className="pointer-events-none absolute top-[10px] left-[10px] bg-obsidian/80 px-[6px] py-[2px] text-[11px] tabular-nums text-paper">
                      0{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => player.toggle(leadSingle(release), visibleQueue)}
                      aria-label={sounding ? `Pausar ${release.track}` : `Escuchar ${release.track}`}
                      className="absolute right-0 bottom-0 z-10 grid size-[44px] place-items-center bg-paper text-obsidian transition-transform duration-150 ease-[var(--ease-out)] hover:bg-ember-red active:scale-[0.94]"
                    >
                      <PlayIcon playing={sounding} size={14} />
                    </button>
                  </div>
                  <div className="mt-[16px] flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[12px] tracking-wider uppercase opacity-60">
                        {release.genre} · {release.year}
                      </p>
                      <Link
                        href={`/album/${release.slug}`}
                        className="mt-[6px] block text-heading-sm font-light no-underline group-hover:underline"
                      >
                        {release.title}
                      </Link>
                      <p className="mt-[4px] text-[16px] opacity-80">{release.artist}</p>
                    </div>
                    <p className="mt-[14px] border-t border-current/15 pt-[10px] text-[12px] opacity-65">
                      Preview: {release.track}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}

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
            {shown && (
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-between px-[12px] py-[8px] text-[12px] font-medium"
                style={{ backgroundColor: shown.ink, color: shown.color }}
              >
                <span className="truncate">{shown.track}</span>
                <span className="ml-[8px] shrink-0 tabular-nums opacity-75">0:30</span>
              </div>
            )}
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
