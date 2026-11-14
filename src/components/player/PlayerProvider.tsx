"use client";

import { motionValue, type MotionValue } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { leadSingle, releases } from "@/content/releases";

/** Anything the player can sound: an album's lead single or a single track from a tracklist. */
export type Playable = {
  id: string;
  albumSlug?: string;
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
  queue: Playable[];
  playing: boolean;
  repeat: boolean;
  muted: boolean;
  elapsed: number;
  duration: number;
  /** 0–1 through the current preview. A MotionValue so progress bars update without re-rendering. */
  progress: MotionValue<number>;
  /** Plays `item`; toggles pause if it is already the current one. Optional `queue` sets the active list. */
  toggle: (item: Playable, queue?: Playable[]) => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  toggleRepeat: () => void;
  toggleMute: () => void;
  close: () => void;
  isPlaying: (id: string) => boolean;
};

const PlayerContext = createContext<Player | null>(null);

const defaultCatalogQueue = () => releases.map(leadSingle);

/** One audio element for the whole site, so starting a preview anywhere stops the previous one. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const [current, setCurrent] = useState<Playable | null>(null);
  const [queue, setQueue] = useState<Playable[]>(defaultCatalogQueue);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(30);
  const progress = useMemo(() => motionValue(0), []);

  // Refs so event listeners always read latest queue/current/repeat without tearing down the Audio element
  const stateRef = useRef({ current, queue, repeat });
  useEffect(() => {
    stateRef.current = { current, queue, repeat };
  }, [current, queue, repeat]);

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

  const playItem = useCallback(
    (item: Playable) => {
      const el = audio.current;
      if (!el) return;
      ensureGraph();
      el.src = item.preview;
      progress.set(0);
      setElapsed(0);
      setDuration(30);
      setCurrent(item);
      void el.play().catch(() => {});
    },
    [ensureGraph, progress]
  );

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

    const onTime = () => {
      const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 30;
      setDuration(dur);
      setElapsed(el.currentTime);
      progress.set(dur ? Math.min(1, el.currentTime / dur) : 0);
    };
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
      const { current: cur, queue: q, repeat: rep } = stateRef.current;
      if (rep && cur) {
        el.currentTime = 0;
        progress.set(0);
        void el.play().catch(() => {});
        return;
      }
      if (cur && q.length > 1) {
        const idx = q.findIndex((x) => x.id === cur.id);
        if (idx !== -1 && idx + 1 < q.length) {
          playItem(q[idx + 1]);
          return;
        }
      }
      onPause();
      progress.set(1);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      el.pause();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
    };
  }, [progress, playItem]);

  const toggle = useCallback(
    (item: Playable, nextQueue?: Playable[]) => {
      const el = audio.current;
      if (!el) return;
      ensureGraph();
      if (nextQueue && nextQueue.length > 0) {
        setQueue(nextQueue);
      } else if (!queue.some((q) => q.id === item.id)) {
        const catalog = defaultCatalogQueue();
        setQueue(catalog.some((q) => q.id === item.id) ? catalog : [item, ...catalog]);
      }
      if (current?.id === item.id) {
        if (el.paused) void el.play().catch(() => {});
        else el.pause();
        return;
      }
      playItem(item);
    },
    [current, queue, ensureGraph, playItem]
  );

  const next = useCallback(() => {
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((x) => x.id === current.id);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % queue.length;
    playItem(queue[nextIdx]);
  }, [current, queue, playItem]);

  const prev = useCallback(() => {
    const el = audio.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      progress.set(0);
      setElapsed(0);
      return;
    }
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((x) => x.id === current.id);
    const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
    playItem(queue[prevIdx]);
  }, [current, queue, playItem, progress]);

  const seek = useCallback(
    (ratio: number) => {
      const el = audio.current;
      if (!el || !current) return;
      const clamped = Math.max(0, Math.min(1, ratio));
      const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : duration;
      el.currentTime = clamped * dur;
      setElapsed(el.currentTime);
      progress.set(clamped);
    },
    [current, duration, progress]
  );

  const toggleRepeat = useCallback(() => setRepeat((r) => !r), []);

  const toggleMute = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  const close = useCallback(() => {
    audio.current?.pause();
    setCurrent(null);
    setElapsed(0);
    progress.set(0);
  }, [progress]);

  // Global keyboard shortcuts when a track is loaded in the player
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }
      if (e.key === " " && tag !== "BUTTON" && tag !== "A") {
        e.preventDefault();
        toggle(current);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const el = audio.current;
        if (el) seek((el.currentTime + 5) / (el.duration || 30));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const el = audio.current;
        if (el) seek((el.currentTime - 5) / (el.duration || 30));
      } else if (e.key === "r" || e.key === "R") {
        toggleRepeat();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, toggle, seek, toggleRepeat, toggleMute]);

  const isPlaying = useCallback((id: string) => playing && current?.id === id, [playing, current]);

  const value = useMemo(
    () => ({
      current,
      queue,
      playing,
      repeat,
      muted,
      elapsed,
      duration,
      progress,
      toggle,
      next,
      prev,
      seek,
      toggleRepeat,
      toggleMute,
      close,
      isPlaying,
    }),
    [
      current,
      queue,
      playing,
      repeat,
      muted,
      elapsed,
      duration,
      progress,
      toggle,
      next,
      prev,
      seek,
      toggleRepeat,
      toggleMute,
      close,
      isPlaying,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
