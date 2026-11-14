"use client";

import { leadSingle, releases } from "@/content/releases";
import { PlayIcon } from "../player/PlayIcon";
import { usePlayer } from "../player/PlayerProvider";
import { RotatingBadge } from "../RotatingBadge";

export function BrandInteractiveBadge() {
  const player = usePlayer();
  const sample = leadSingle(releases[3] ?? releases[0]);
  const sounding = player.isPlaying(sample.id);

  return (
    <div className="flex flex-wrap items-center gap-[45px] bg-obsidian p-[45px] text-paper">
      <RotatingBadge
        label={sounding ? "SONANDO" : "ESCUCHA"}
        size={110}
        center={<PlayIcon playing={sounding} size={22} />}
        onClick={() => player.toggle(sample)}
        ariaLabel={sounding ? `Pausar ${sample.track}` : `Probar pulso del logo con ${sample.track}`}
      />
      <RotatingBadge label="ON REPEAT" size={90} />
      <p className="max-w-[32ch] text-[14px] text-paper/75">
        Pulsa el sello para reproducir un preview: verás cómo los puntos Ember Red de todos los logos de esta página
        laten en tiempo real con las frecuencias bajas.
      </p>
    </div>
  );
}
