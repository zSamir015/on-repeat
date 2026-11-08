import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { RotatingBadge } from "@/components/RotatingBadge";
import { releases } from "@/content/releases";

export const metadata: Metadata = {
  title: "Marca — On Repeat",
  description: "Logo, color, tipografía y voz de On Repeat.",
};

const CORE = [
  { name: "Obsidian", hex: "#000000", role: "Escenario, texto sobre claro", ink: "#ffffff" },
  { name: "Paper", hex: "#FFFFFF", role: "Galería, texto sobre oscuro", ink: "#000000", border: true },
  { name: "Ember Red", hex: "#EE3A49", role: "Los puntos del logo y las etiquetas cortas. Nunca de fondo.", ink: "#000000" },
  { name: "Graphite", hex: "#666666", role: "Texto secundario sobre negro", ink: "#ffffff" },
  { name: "Signal Blue", hex: "#007BFF", role: "Acciones con borde sobre blanco", ink: "#ffffff" },
];

const DOWNLOADS = [
  { file: "on-repeat-logo-black.svg", label: "Logo, negro", bg: "bg-paper border border-obsidian/15" },
  { file: "on-repeat-logo-white.svg", label: "Logo, blanco", bg: "bg-obsidian" },
  { file: "on-repeat-logo-mono.svg", label: "Logo, una tinta", bg: "bg-paper border border-obsidian/15" },
  { file: "on-repeat-mark-black.svg", label: "Símbolo", bg: "bg-paper border border-obsidian/15" },
  { file: "on-repeat-app-icon.svg", label: "Ícono de app", bg: "bg-[#e9e9e9]" },
];

const VOICE = [
  { yes: "Escuchar preview", no: "Click aquí para reproducir" },
  { yes: "Nada con “zzz”. Prueba con otro artista.", no: "¡Ups! Algo salió mal :(" },
  { yes: "Tu lanzamiento, presentado en grande.", no: "La plataforma #1 de promoción musical" },
  { yes: "NEW DROP", no: "¡¡NUEVO LANZAMIENTO EXCLUSIVO!!" },
];

function Section({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-[28px] border-t border-obsidian pt-[28px] md:grid-cols-12 md:gap-[25px]">
      <div className="md:col-span-4">
        <h2 className="text-heading-lg font-normal">{title}</h2>
        <p className="mt-[10px] max-w-[38ch] text-body text-graphite">{lead}</p>
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

export default function BrandPage() {
  return (
    <>
      <header className="on-dark bg-obsidian text-paper">
        <div className="shell flex h-[72px] items-center justify-between">
          <Link href="/" aria-label="On Repeat, inicio">
            <Logo height={22} />
          </Link>
          <Link href="/" className="text-[14px] no-underline hover:underline">
            Volver al sitio
          </Link>
        </div>
        <div className="shell pt-[100px] pb-[100px]">
          <Logo fluid intro delay={0.1} />
          <div className="mt-[45px] grid gap-[28px] md:grid-cols-12">
            <h1 className="type-display md:col-span-7">Todo lo que va entre los dos signos se toca otra vez.</h1>
            <p className="max-w-[44ch] text-body text-paper/75 md:col-span-4 md:col-start-9 md:self-end">
              En una partitura, ‖: abre una repetición y :‖ la cierra. El logo pone el nombre entre los dos: es,
              literalmente, música en repeat. Las barras son rectas como el resto del sistema y los puntos son el
              único rojo.
            </p>
          </div>
        </div>
      </header>

      <main className="shell flex flex-col gap-[100px] py-[100px]">
        <Section title="Versiones" lead="Usa el logo completo siempre que quepa. El símbolo es para espacios cuadrados y tamaños chicos.">
          <ul className="grid gap-[10px] sm:grid-cols-2">
            {DOWNLOADS.map((d) => (
              <li key={d.file}>
                <a href={`/brand/${d.file}`} download className="group block no-underline">
                  <span className={`grid aspect-[16/9] place-items-center p-[25px] ${d.bg}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/brand/${d.file}`} alt={d.label} className="max-h-[60%] max-w-[80%]" />
                  </span>
                  <span className="mt-[8px] flex justify-between text-[14px]">
                    <span>{d.label}</span>
                    <span className="text-signal-blue group-hover:underline">Descargar SVG</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Construcción" lead="Dos signos de repetición y el nombre en Inter Regular, minúscula y apretado. Los puntos caen dentro de la altura de las minúsculas.">
          <div className="relative border border-obsidian/15 p-[45px] sm:p-[70px]">
            <Logo fluid />
            <dl className="mt-[28px] grid grid-cols-2 gap-[18px] text-[14px] sm:grid-cols-4">
              <div>
                <dt className="text-graphite">Barra gruesa</dt>
                <dd>11% de la altura</dd>
              </div>
              <div>
                <dt className="text-graphite">Barra fina</dt>
                <dd>3.5%</dd>
              </div>
              <div>
                <dt className="text-graphite">Puntos</dt>
                <dd>Ember Red, en el cuerpo de las minúsculas</dd>
              </div>
              <div>
                <dt className="text-graphite">Nombre</dt>
                <dd>Inter Regular, −0.035em</dd>
              </div>
            </dl>
          </div>
        </Section>

        <Section title="Espacio y tamaño" lead="Deja libre alrededor del logo al menos el ancho del signo de repetición. Por debajo de 20 px de alto, usa el símbolo.">
          <div className="grid gap-[10px] sm:grid-cols-[2fr_1fr]">
            <div className="grid place-items-center bg-[#f2f2f2] p-[45px]">
              <div className="outline-1 outline-offset-[18px] outline-signal-blue outline-dashed">
                <Logo height={56} />
              </div>
            </div>
            <div className="flex flex-col justify-between gap-[25px] bg-[#f2f2f2] p-[25px]">
              <div className="flex items-end gap-[18px]">
                <Logo height={20} />
                <span className="text-caption text-graphite">20 px, mínimo</span>
              </div>
              <div className="flex items-end gap-[18px]">
                <Logo variant="mark" height={16} />
                <span className="text-caption text-graphite">16 px, símbolo</span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Color" lead="La marca es negro, blanco y un rojo. El resto del color lo pone cada disco: sus páginas y secciones toman el color de la portada.">
          <ul className="grid grid-cols-2 gap-[10px] sm:grid-cols-5">
            {CORE.map((c) => (
              <li key={c.hex}>
                <div
                  className={`flex aspect-[3/4] flex-col justify-end p-[18px] ${c.border ? "border border-obsidian/15" : ""}`}
                  style={{ backgroundColor: c.hex, color: c.ink }}
                >
                  <span className="text-[14px] font-medium">{c.name}</span>
                  <span className="text-caption tabular-nums opacity-80">{c.hex}</span>
                </div>
                <p className="mt-[8px] text-caption text-graphite">{c.role}</p>
              </li>
            ))}
          </ul>
          <p className="mt-[45px] text-subheading">El disco pone el color</p>
          <ul className="mt-[18px] grid grid-cols-4 gap-[10px] sm:grid-cols-8">
            {releases.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/album/${r.slug}`}
                  className="flex aspect-square items-end p-[10px] text-caption no-underline"
                  style={{ backgroundColor: r.color, color: r.ink }}
                >
                  {r.color.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tipografía" lead="Una sola familia, Inter. Los títulos van en Light, grandes y apretados; el texto corrido en Regular, con aire.">
          <div className="flex flex-col gap-[28px]">
            <p className="type-display-xl">Marea Lenta</p>
            <div className="grid gap-[18px] text-[14px] sm:grid-cols-3">
              <p>
                <span className="block text-graphite">Display</span>Inter Light 300, 75–90 px, −0.053em
              </p>
              <p>
                <span className="block text-graphite">Títulos</span>Inter Regular 400, 27–35 px
              </p>
              <p>
                <span className="block text-graphite">Texto</span>Inter Regular 400, 19–20 px, interlineado 1.48
              </p>
            </div>
            <p className="max-w-[60ch] text-body">
              Grabado en un cuarto de tres por tres con la ventana abierta. Se escucha la ciudad, y está bien así.
            </p>
          </div>
        </Section>

        <Section title="Voz" lead="Directa, joven y en Spanglish: el texto en español, las etiquetas cortas en inglés. Cada botón dice lo que hace.">
          <ul className="grid gap-[10px]">
            {VOICE.map((v) => (
              <li key={v.yes} className="grid gap-[10px] sm:grid-cols-2">
                <p className="bg-[#f2f2f2] px-[18px] py-[14px] text-subheading">{v.yes}</p>
                <p className="px-[18px] py-[14px] text-subheading text-graphite line-through decoration-ember-red">{v.no}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Así no" lead="El logo no se deforma, no cambia los puntos de color y nunca lleva esquinas redondas ni sombras.">
          <ul className="grid gap-[10px] sm:grid-cols-3">
            <li>
              <div className="grid aspect-[16/9] place-items-center overflow-hidden bg-[#f2f2f2]">
                <div className="scale-x-150">
                  <Logo height={28} />
                </div>
              </div>
              <p className="mt-[8px] text-caption text-graphite">No lo estires</p>
            </li>
            <li>
              <div className="grid aspect-[16/9] place-items-center bg-[#f2f2f2]">
                <Logo height={28} accent="#0fa64b" />
              </div>
              <p className="mt-[8px] text-caption text-graphite">No cambies el rojo de los puntos</p>
            </li>
            <li>
              <div className="grid aspect-[16/9] place-items-center bg-[#f2f2f2]">
                <span className="bg-obsidian px-[22px] py-[14px] text-paper" style={{ clipPath: "inset(0 round 999px)" }}>
                  <Logo height={22} />
                </span>
              </div>
              <p className="mt-[8px] text-caption text-graphite">No lo metas en formas redondeadas</p>
            </li>
          </ul>
        </Section>

        <Section title="Sello" lead="El sello giratorio lleva el símbolo al centro. Va en el escenario negro, abajo a la derecha, y es la acción principal.">
          <div className="flex items-center gap-[45px] bg-obsidian p-[45px]">
            <RotatingBadge label="ESCUCHA" size={110} />
            <RotatingBadge label="ON REPEAT" size={90} />
          </div>
        </Section>
      </main>
    </>
  );
}
