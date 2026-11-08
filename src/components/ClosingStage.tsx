"use client";

import Link from "next/link";
import { Logo } from "./brand/Logo";
import { RotatingBadge } from "./RotatingBadge";

export function ClosingStage() {
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
              Sube tu single o EP y lo montamos con su propia página de lanzamiento: pre-save, visualizer y un
              lugar en el catálogo.
            </p>
            <a href="#subir" className="ghost-action self-start">
              Sube tu música
            </a>
          </div>
        </div>

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
