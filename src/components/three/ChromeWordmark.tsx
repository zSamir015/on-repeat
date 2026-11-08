"use client";

import { Text3D, useFont } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { MathUtils, type Group } from "three";
import { audioLevel } from "../player/PlayerProvider";
import { asset } from "@/lib/asset";
import { StudioEnvironment } from "./StudioEnvironment";

const FONT = asset("/fonts/inter-light.typeface.json");
const TRACKING = -0.053; // em, same as the display type in CSS
const LINE_ADVANCE = 0.98; // em between baselines when the name breaks onto two lines
const CAP = 0.727; // Inter cap height in em

type Props = {
  text: string;
  textNarrow: string;
  reduceMotion: boolean;
  accents: string[];
};

type Glyph = { ch: string; x: number; y: number; w: number; i: number };

/** Lay the name out glyph by glyph so every letter can move on its own. */
function useLayout(content: string) {
  const font = useFont(FONT);
  return useMemo(() => {
    const data = font.data as unknown as { glyphs: Record<string, { ha: number }>; resolution: number };
    const unit = 1 / data.resolution;
    const lines = content.split("\n");
    const glyphs: Glyph[] = [];
    let width = 0;
    let i = 0;

    lines.forEach((line, row) => {
      const advances = [...line].map((ch) => (data.glyphs[ch]?.ha ?? 300) * unit);
      const lineWidth = advances.reduce((a, b) => a + b, 0) + TRACKING * (advances.length - 1);
      width = Math.max(width, lineWidth);
      let x = -lineWidth / 2;
      const y = ((lines.length - 1) / 2 - row) * LINE_ADVANCE - CAP / 2;
      [...line].forEach((ch, k) => {
        if (ch !== " ") glyphs.push({ ch, x, y, w: advances[k], i: i++ });
        x += advances[k] + TRACKING;
      });
    });

    return { glyphs, width, height: (lines.length - 1) * LINE_ADVANCE + CAP };
  }, [font, content]);
}

function Wordmark({ text, textNarrow, reduceMotion }: Omit<Props, "accents">) {
  const { viewport, pointer } = useThree();
  const narrow = viewport.aspect < 1;
  const { glyphs, width, height } = useLayout(narrow ? textNarrow : text);

  const scale = Math.min((viewport.width * (narrow ? 0.86 : 0.88)) / width, (viewport.height * 0.6) / height);

  const tilt = useRef<Group>(null);
  const letters = useRef<(Group | null)[]>([]);
  const lift = useRef<number[]>([]);
  const born = useRef<number | null>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (born.current === null) born.current = t;
    const age = t - born.current;
    const k = 1 - Math.exp(-delta * 4);

    if (tilt.current) {
      // Whole name turns toward the pointer; resting tilt lays the studio horizon across the faces.
      const tx = -0.045 + (reduceMotion ? 0 : -pointer.y * 0.2);
      const ty = reduceMotion ? 0 : pointer.x * 0.35;
      tilt.current.rotation.x = MathUtils.lerp(tilt.current.rotation.x, tx, k);
      tilt.current.rotation.y = MathUtils.lerp(tilt.current.rotation.y, ty, k);
    }

    // Whatever is playing pumps the letters: bass lifts them, each on its own phase.
    const level = reduceMotion ? 0 : audioLevel.get();

    // Pointer position in the name's own units.
    const px = (pointer.x * viewport.width) / 2 / scale;

    glyphs.forEach((g, n) => {
      const node = letters.current[n];
      if (!node) return;

      if (reduceMotion) {
        node.position.set(g.x + g.w / 2, g.y + CAP / 2, 0);
        node.rotation.set(0, 0, 0);
        return;
      }

      // Entrance: each letter rises and swings upright, staggered left to right.
      const p = MathUtils.clamp((age - 0.25 - g.i * 0.07) / 1.1, 0, 1);
      const e = 1 - Math.pow(1 - p, 4);

      // Idle wave travelling through the name.
      const wave = Math.sin(t * 1.6 - g.i * 0.55);
      const sway = Math.sin(t * 0.9 - g.i * 0.5);

      // Letters near the pointer lift toward it.
      const d = px - (g.x + g.w / 2);
      const near = Math.exp(-(d * d) / 0.5);
      lift.current[n] = MathUtils.lerp(lift.current[n] ?? 0, near, k);
      const l = lift.current[n];

      const kick = level * (0.55 + 0.45 * Math.sin(t * 7 + g.i * 1.3));
      node.position.set(
        g.x + g.w / 2,
        g.y + CAP / 2 + wave * 0.05 + l * 0.16 + kick * 0.32 - (1 - e) * 1.4,
        l * 0.35 + kick * 0.4
      );
      node.scale.setScalar(1 + kick * 0.12);
      node.rotation.set((1 - e) * 1.7 - l * 0.25, sway * 0.15 + l * Math.sign(d) * 0.18, Math.sin(t * 0.7 - g.i) * 0.03);
    });
  });

  return (
    <group ref={tilt}>
      <group scale={scale}>
        {glyphs.map((g, n) => (
          <group
            key={`${g.ch}-${g.i}`}
            ref={(node) => {
              letters.current[n] = node;
            }}
            position={[g.x + g.w / 2, g.y + CAP / 2 - (reduceMotion ? 0 : 1.4), 0]}
          >
            {/* Offset so each letter turns around its own center */}
            <Text3D
              font={FONT}
              position={[-g.w / 2, -CAP / 2, -0.11]}
              size={1}
              height={0.22}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.06}
              bevelSize={0.026}
              bevelSegments={10}
              smooth={0.008}
            >
              {g.ch}
              <meshPhysicalMaterial
                color="#f4f4f4"
                metalness={1}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.05}
                envMapIntensity={1.4}
              />
            </Text3D>
          </group>
        ))}
      </group>
    </group>
  );
}

export default function ChromeWordmark(props: Props & { active: boolean }) {
  const { active, accents, ...rest } = props;
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 10], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={active ? "always" : "never"}
      aria-hidden
    >
      <Suspense fallback={null}>
        <StudioEnvironment sweep={!rest.reduceMotion} accents={accents} />
        <Wordmark {...rest} />
      </Suspense>
    </Canvas>
  );
}

useFont.preload(FONT);
