"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredDrop, findRelease, leadSingle } from "@/content/releases";
import { PlayIcon } from "./player/PlayIcon";
import { usePlayer } from "./player/PlayerProvider";
import { scrollVelocity } from "./motion/SmoothScroll";
import { useStageActive } from "./motion/useStageActive";
import { Logo } from "./brand/Logo";
import { RotatingBadge } from "./RotatingBadge";
import { SiteMenu } from "./SiteMenu";
import { ChromeWordmark } from "./three/lazy";

const NAV = [
  { label: "Drops", href: "#drops" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Artistas", href: "#artistas" },
];

const easeOut = [0.23, 1, 0.32, 1] as const;

export function HeroStage() {
  const reduce = useReducedMotion() ?? false;
  const [stageRef, active] = useStageActive<HTMLElement>("0px");
  const player = usePlayer();
  const release = findRelease(featuredDrop.slug)!;
  const sounding = player.isPlaying(release.slug);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });

  // Scroll-velocity lean: the chrome type shears with the speed of the scroll, then settles.
  const velocity = useSpring(scrollVelocity, { stiffness: 400, damping: 50 });
  const skewY = useTransform(velocity, [-40, 0, 40], [5, 0, -5], { clamp: true });

  // Leaving the stage: the chrome type sinks and recedes while the page slides over it.
  const sink = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const recede = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={stageRef}
      aria-label={`${featuredDrop.artist}, ${featuredDrop.title}`}
      className="on-dark relative isolate flex h-svh min-h-[560px] w-full flex-col overflow-hidden bg-obsidian text-paper"
    >
      <nav aria-label="Principal" className="relative z-10 shell flex items-center justify-between pt-[26px]">
        <motion.ul
          className="flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[14px] leading-[1.5]"
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
        >
          <motion.li variants={navItem}>
            <Link href="/" aria-label="On Repeat, inicio" className="block py-[6px] text-paper">
              <Logo height={26} intro delay={0.15} />
            </Link>
          </motion.li>
          {NAV.map((item) => (
            <Fragment key={item.href}>
              <motion.li variants={navItem} aria-hidden className="hidden text-graphite sm:list-item">
                →
              </motion.li>
              <motion.li variants={navItem} className="hidden sm:list-item">
                <a href={item.href} className="text-paper no-underline hover:underline">
                  {item.label}
                </a>
              </motion.li>
            </Fragment>
          ))}
        </motion.ul>
        <a href="#subir" className="hidden text-[14px] text-paper no-underline hover:underline sm:inline">
          Sube tu música
        </a>
        <div className="sm:hidden">
          <SiteMenu inlineFrom="sm" />
        </div>
      </nav>

      <motion.div
        className="absolute inset-0 -z-0"
        style={reduce ? undefined : { skewY, y: sink, scale: recede, opacity: fade }}
      >
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: easeOut, delay: 0.1 }}
        >
          <ChromeWordmark
            text={featuredDrop.artist}
            textNarrow={featuredDrop.artistMobile}
            reduceMotion={reduce}
            accents={featuredDrop.accents}
            active={active}
          />
        </motion.div>
      </motion.div>

      {/* Accessible name for the 3D type */}
      <h1 className="sr-only">{featuredDrop.artist}</h1>

      <div className="relative z-10 mt-auto shell flex items-end justify-between gap-6 pb-[28px]">
        <motion.div
          className="flex items-end gap-[20px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.6 }}
        >
          <Image
            src={featuredDrop.cover}
            alt={`Portada de ${featuredDrop.title}`}
            width={112}
            height={112}
            priority
            className="hidden size-[112px] object-cover sm:block"
          />
          <div>
            <p className="kicker">{featuredDrop.format}</p>
            <p className="mt-[10px] text-heading-sm font-light text-paper sm:text-heading">{featuredDrop.title}</p>
            <p className="mt-[8px] text-caption text-graphite">{featuredDrop.status}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.9, bounce: 0.25, delay: 0.8 }}
          className="shrink-0"
        >
          <RotatingBadge
            label={sounding ? "SONANDO" : "ESCUCHA"}
            center={<PlayIcon playing={sounding} size={20} />}
            onClick={() => player.toggle(leadSingle(release))}
            ariaLabel={sounding ? `Pausar ${release.track}` : `Escuchar ${release.track}, de ${release.artist}`}
          />
        </motion.div>
      </div>
    </section>
  );
}

const navItem = {
  hidden: { opacity: 0, y: -8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};
