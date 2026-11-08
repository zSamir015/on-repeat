"use client";

import { motionValue, type MotionValue } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Anything the player can sound: an album's lead single or a single track from a tracklist. */
export type Playable = {
  id: string;
  track: string;
  artist: string;
  album: string;
  cover: string;
  color: string;
  ink: string;
  preview: string;
};

/**
 * Low-frequency energy of whatever is playing, 0–1. Module-level so WebGL scenes can read it
 * every frame without React re-renders.
 */
export const audioLevel = motionValue(0);

type Player = {
  current: Playable | null;
  playing: boolean;
  /** 0–1 through the current preview. A MotionValue so progress bars update without re-rendering. */
  progress: MotionValue<number>;
  /** Plays `item`; toggles pause if it is already the current one. */
  toggle: (item: Playable) => void;
  close: () => void;
  isPlaying: (id: string) => boolean;
};

const PlayerContext = createContext<Player | null>(null);

/** One audio element for the whole site, so starting a preview anywhere stops the previous one. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const [current, setCurrent] = useState<Playable | null>(null);
  const [playing, setPlaying] = useState(false);
  const progress = useMemo(() => motionValue(0), []);

  useEffect(() => {
    const el = new Audio();
    el.preload = "none";
    el.crossOrigin = "anonymous"; // iTunes previews send CORS headers, so the analyser can read them
    audio.current = el;

    let raf = 0;
    const bins = new Uint8Array(32);
    const meter = () => {
      const a = analyser.current;
      if (a) {
        a.getByteFrequencyData(bins);
        // Average the lowest bins (kick and bass), with a little smoothing toward the new value.
        const bass = (bins[1] + bins[2] + bins[3] + bins[4]) / (4 * 255);
        audioLevel.set(audioLevel.get() * 0.6 + bass * 0.4);
      }
      raf = requestAnimationFrame(meter);
    };

    const onTime = () => progress.set(el.duration ? el.currentTime / el.duration : 0);
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(meter);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
      audioLevel.set(0);
    };
    const onEnd = () => {
      onPause();
      progress.set(1);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      el.pause();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
    };
  }, [progress]);

  /** The audio graph needs a user gesture, so it is built on the first play. */
  const ensureGraph = useCallback(() => {
    if (analyser.current || !audio.current) return;
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio.current);
      const node = ctx.createAnalyser();
      node.fftSize = 64;
      source.connect(node);
      node.connect(ctx.destination);
      analyser.current = node;
    } catch {
      // No Web Audio: previews still play, the chrome just doesn't react.
    }
  }, []);

  const toggle = useCallback(
    (item: Playable) => {
      const el = audio.current;
      if (!el) return;
      ensureGraph();
      if (current?.id === item.id) {
        if (el.paused) void el.play();
        else el.pause();
        return;
      }
      el.src = item.preview;
      progress.set(0);
      setCurrent(item);
      void el.play();
    },
    [current, progress, ensureGraph]
  );

  const close = useCallback(() => {
    audio.current?.pause();
    setCurrent(null);
    progress.set(0);
  }, [progress]);

  const isPlaying = useCallback((id: string) => playing && current?.id === id, [playing, current]);

  const value = useMemo(
    () => ({ current, playing, progress, toggle, close, isPlaying }),
    [current, playing, progress, toggle, close, isPlaying]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
