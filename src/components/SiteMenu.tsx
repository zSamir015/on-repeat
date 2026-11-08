"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { setScrollLocked } from "./motion/SmoothScroll";
import { usePlayer } from "./player/PlayerProvider";
import { Logo } from "./brand/Logo";

const LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Drops", href: "/#drops" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Artistas", href: "/#artistas" },
];

const easeOut = [0.23, 1, 0.32, 1] as const;
const easeInOut = [0.77, 0, 0.175, 1] as const;

type Tone = "inherit" | "red";

/**
 * Site navigation. Wide screens get the links inline; below `md` a "Menú" button opens a
 * full-screen sheet where each link rises out of its own line.
 */
export function SiteMenu({ tone = "inherit", inlineFrom = "md" }: { tone?: Tone; inlineFrom?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  // True only on the client, so the portal never renders during SSR.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const reduce = useReducedMotion() ?? false;
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const { current, playing } = usePlayer();

  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    setScrollLocked(true);
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      setScrollLocked(false);
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  const color = tone === "red" ? "text-ember-red" : "text-inherit";
  const inline = inlineFrom === "sm" ? "hidden sm:flex" : "hidden md:flex";
  const button = inlineFrom === "sm" ? "sm:hidden" : "md:hidden";

  return (
    <>
      <nav aria-label="Principal" className={inline}>
        <ul className={`flex gap-[18px] text-[14px] ${color}`}>
          {LINKS.slice(1).map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="no-underline hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="site-menu"
        className={`${button} ${color} -mr-[10px] h-[44px] px-[10px] text-[14px]`}
      >
        Menú
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                id="site-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Menú"
                className="on-dark fixed inset-0 z-[60] flex flex-col bg-obsidian text-paper"
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
                exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
                transition={{ duration: 0.5, ease: easeInOut }}
              >
                <div className="shell flex h-[72px] items-center justify-between">
                  <Logo height={26} />
                  <button type="button" onClick={() => setOpen(false)} className="-mr-[10px] h-[44px] px-[10px] text-[14px]">
                    Cerrar
                  </button>
                </div>

                <nav aria-label="Menú principal" className="shell flex flex-1 flex-col justify-center">
                  <ul>
                    {LINKS.map((l, i) => (
                      <li key={l.href} className="overflow-hidden">
                        <motion.div
                          initial={reduce ? false : { y: "105%" }}
                          animate={{ y: "0%" }}
                          exit={{ y: "105%", transition: { duration: 0.2, ease: easeOut } }}
                          transition={{ duration: 0.6, ease: easeOut, delay: 0.18 + i * 0.06 }}
                        >
                          <Link
                            ref={i === 0 ? firstLink : undefined}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="type-display-xl block py-[6px] no-underline active:opacity-60"
                          >
                            {l.label}
                          </Link>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </nav>

                {current && (
                  <motion.div
                    className="shell flex items-center gap-[18px] pb-[28px]"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeOut, delay: 0.45 }}
                  >
                    <Image src={current.cover} alt="" width={48} height={48} className="size-[48px] object-cover" />
                    <p className="text-[14px]">
                      <span className="block text-graphite">{playing ? "Sonando" : "En pausa"}</span>
                      {current.track}, {current.artist}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
