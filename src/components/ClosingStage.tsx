"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { setCustomHeroDrop, setStudioOpen, useStudioState } from "@/content/custom-drop";
import { asset } from "@/lib/asset";
import { Logo } from "./brand/Logo";
import { RotatingBadge } from "./RotatingBadge";

const SWATCHES = [
  { name: "Ember", color: "#ee3a49", ink: "#000000", gel2: "#ffb547" },
  { name: "Lima", color: "#8ace00", ink: "#000000", gel2: "#ffffff" },
  { name: "Cobalto", color: "#2a56a3", ink: "#fff4ea", gel2: "#7dd3fc" },
  { name: "Sol", color: "#ffb547", ink: "#111111", gel2: "#ee3a49" },
  { name: "Selva", color: "#2e5a2b", ink: "#f4efd6", gel2: "#4fa83a" },
] as const;

const FORMATS = ["SINGLE", "NEW EP", "ALBUM"] as const;

export function ClosingStage() {
  const { studioOpen, customDrop } = useStudioState();
  const [artist, setArtist] = useState("MAREA LENTA");
  const [title, setTitle] = useState("Cuarto de tres por tres");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("NEW EP");
  const [swatchIdx, setSwatchIdx] = useState(0);
  const [demoUrl, setDemoUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const swatch = SWATCHES[swatchIdx];
  const cleanArtist = (artist.trim() || "TU ARTISTA").toUpperCase();
  const cleanTitle = title.trim() || "Tu lanzamiento";

  const previewOnHero = () => {
    const words = cleanArtist.split(/\s+/);
    const mobile =
      words.length > 1
        ? `${words.slice(0, Math.ceil(words.length / 2)).join(" ")}\n${words.slice(Math.ceil(words.length / 2)).join(" ")}`
        : cleanArtist;

    setCustomHeroDrop({
      slug: "debi-tirar-mas-fotos",
      artist: cleanArtist,
      artistMobile: mobile,
      title: cleanTitle,
      format,
      status: "Previsualización de artista · 2026",
      cover: asset("/covers/debi-tirar-mas-fotos.jpg"),
      accents: [swatch.color, swatch.gel2],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <footer id="subir" className="on-dark bg-obsidian pt-[100px] pb-[28px] text-paper">
      <div className="shell">
        <div id="artistas" className="grid gap-[45px] md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="kicker">PARA ARTISTAS</p>
            <h2 className="type-display mt-[28px] max-w-[12ch]">Tu lanzamiento, presentado en grande.</h2>
          </div>
          <div className="flex flex-col justify-end gap-[28px] md:col-span-4 md:col-start-9">
            <p className="text-body text-paper/80">
              Sube tu single o EP y lo montamos con su propia página de lanzamiento: tipografía en cromo 3D,
              pre-save, preview de 30 s y un lugar en el catálogo.
            </p>
            <div className="flex flex-wrap items-center gap-[14px]">
              <button
                type="button"
                aria-expanded={studioOpen}
                aria-controls="artist-studio-panel"
                onClick={() => setStudioOpen(!studioOpen)}
                className="ghost-action cursor-pointer"
              >
                {studioOpen ? "Cerrar estudio ×" : "Sube tu música"}
              </button>
              {!studioOpen && (
                <button
                  type="button"
                  onClick={() => setStudioOpen(true)}
                  className="text-[14px] text-paper/75 underline-offset-4 hover:text-paper hover:underline"
                >
                  Probar mi nombre en 3D →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Artist Launch Studio */}
        <AnimatePresence initial={false}>
          {studioOpen && (
            <motion.div
              id="artist-studio-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-[60px] grid gap-[44px] border border-paper/25 p-[28px] sm:p-[44px] md:grid-cols-12">
                <form onSubmit={handleSubmit} className="flex flex-col gap-[24px] md:col-span-7">
                  <div className="flex items-center justify-between border-b border-paper/15 pb-[14px]">
                    <p className="text-[13px] font-medium tracking-[0.1em] text-ember-red uppercase">
                      ESTUDIO DE LANZAMIENTO · DEMO INTERACTIVA
                    </p>
                    {customDrop && (
                      <button
                        type="button"
                        onClick={() => setCustomHeroDrop(null)}
                        className="text-[12px] text-graphite hover:text-paper"
                      >
                        Restaurar escenario original
                      </button>
                    )}
                  </div>

                  <div className="grid gap-[20px] sm:grid-cols-2">
                    <label className="block">
                      <span className="block text-[12px] tracking-wider text-graphite uppercase">
                        Nombre del artista (Cromo 3D)
                      </span>
                      <input
                        type="text"
                        maxLength={22}
                        value={artist}
                        onChange={(e) => {
                          setArtist(e.target.value);
                          setSubmitted(false);
                        }}
                        placeholder="Ej. MAREA LENTA"
                        className="mt-[8px] h-[44px] w-full border-b border-paper/40 bg-transparent text-subheading text-paper focus:border-paper focus:outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[12px] tracking-wider text-graphite uppercase">
                        Título del lanzamiento
                      </span>
                      <input
                        type="text"
                        maxLength={40}
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setSubmitted(false);
                        }}
                        placeholder="Ej. Cuarto de tres por tres"
                        className="mt-[8px] h-[44px] w-full border-b border-paper/40 bg-transparent text-subheading text-paper focus:border-paper focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid gap-[20px] sm:grid-cols-2">
                    <div>
                      <span className="block text-[12px] tracking-wider text-graphite uppercase">Formato</span>
                      <div className="mt-[10px] flex gap-[8px]" role="group" aria-label="Formato">
                        {FORMATS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            aria-pressed={format === f}
                            onClick={() => setFormat(f)}
                            className={`h-[36px] border px-[12px] text-[12px] font-medium transition-colors ${
                              format === f
                                ? "border-paper bg-paper text-obsidian"
                                : "border-paper/30 text-paper/75 hover:border-paper"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[12px] tracking-wider text-graphite uppercase">
                        Color de portada y geles 3D
                      </span>
                      <div className="mt-[10px] flex items-center gap-[8px]" role="group" aria-label="Color de acento">
                        {SWATCHES.map((s, i) => (
                          <button
                            key={s.name}
                            type="button"
                            aria-label={s.name}
                            aria-pressed={swatchIdx === i}
                            onClick={() => setSwatchIdx(i)}
                            className={`size-[36px] border-2 transition-transform ${
                              swatchIdx === i ? "scale-110 border-paper" : "border-transparent opacity-75 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: s.color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="block">
                    <span className="block text-[12px] tracking-wider text-graphite uppercase">
                      Enlace al demo (Spotify, SoundCloud o Drive)
                    </span>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => {
                        setDemoUrl(e.target.value);
                        setSubmitted(false);
                      }}
                      placeholder="https://open.spotify.com/..."
                      className="mt-[8px] h-[44px] w-full border-b border-paper/40 bg-transparent text-[16px] text-paper placeholder:text-graphite focus:border-paper focus:outline-none"
                    />
                  </label>

                  <div className="mt-[8px] flex flex-wrap items-center gap-[16px]">
                    <button
                      type="button"
                      onClick={previewOnHero}
                      className="flex h-[48px] items-center gap-[10px] bg-paper px-[20px] text-[14px] font-medium text-obsidian transition-colors hover:bg-ember-red"
                    >
                      <span>Ver mi nombre en el escenario 3D ↑</span>
                    </button>
                    <button
                      type="submit"
                      className="ghost-action h-[48px] cursor-pointer px-[20px]"
                    >
                      {submitted ? "‖: Solicitud guardada :‖" : "Enviar lanzamiento"}
                    </button>
                  </div>

                  {submitted && (
                    <p className="border-l-2 border-ember-red pl-[14px] text-[14px] text-paper/85" role="status">
                      Recibimos la ficha de <strong>{cleanTitle}</strong> ({cleanArtist}). También puedes pulsar{" "}
                      <button
                        type="button"
                        onClick={previewOnHero}
                        className="text-ember-red underline underline-offset-4"
                      >
                        Ver mi nombre en el escenario 3D ↑
                      </button>{" "}
                      para ver cómo luce tu tipografía en cromo en la portada.
                    </p>
                  )}
                </form>

                {/* Live Editorial Card Preview */}
                <div
                  className="flex flex-col justify-between p-[28px] transition-colors duration-300 md:col-span-5"
                  style={{ backgroundColor: swatch.color, color: swatch.ink }}
                >
                  <div className="flex items-center justify-between border-b border-current/25 pb-[12px] text-[12px] font-medium tracking-wider uppercase">
                    <span>{format} · PREVIEW DE FICHA</span>
                    <span>‖: :‖</span>
                  </div>

                  <div className="my-[36px]">
                    <p className="text-[12px] uppercase opacity-70">ARTISTA EN ESCENA</p>
                    <p className="mt-[6px] text-heading-lg font-light tracking-tight break-words">
                      {cleanArtist}
                    </p>
                    <p className="mt-[20px] text-[12px] uppercase opacity-70">LANZAMIENTO</p>
                    <p className="mt-[4px] text-heading-sm font-normal break-words">{cleanTitle}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-current/25 pt-[14px] text-[12px] tabular-nums opacity-80">
                    <span>PALETA: {swatch.color.toUpperCase()}</span>
                    <span>ON REPEAT STUDIO</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-[145px] flex items-end justify-between gap-[25px]">
          <div className="min-w-0 flex-1">
            <Logo fluid intro introOnView />
          </div>
          <RotatingBadge label="ON REPEAT" size={90} className="mb-[12px] hidden shrink-0 sm:block" />
        </div>

        <div className="mt-[44px] flex flex-col gap-[10px] border-t border-graphite pt-[20px] text-[14px] text-graphite sm:flex-row sm:justify-between">
          <p>
            © 2026 On Repeat ·{" "}
            <Link href="/marca" className="text-paper/80 no-underline hover:underline">
              Marca
            </Link>
          </p>
          <p>Portadas y nombres pertenecen a sus artistas y sellos. Prototipo sin afiliación.</p>
        </div>
      </div>
    </footer>
  );
}
