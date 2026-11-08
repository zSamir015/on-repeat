"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * Offline studio for the hero chrome: softboxes baked into an environment map. Chrome shows only
 * what it reflects, so these panels ARE the look. A bright "sky" in front and above, a thin hot
 * horizon line, one white strip sweeping side to side, and colored gels (the featured album's
 * palette) orbiting the set so tinted streaks keep travelling across the metal.
 * Lightformers aim at the origin by default.
 */
export function StudioEnvironment({ sweep = true, accents = [] }: { sweep?: boolean; accents?: string[] }) {
  const strip = useRef<Group>(null);
  const orbit = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!sweep) return;
    const t = clock.elapsedTime;
    if (strip.current) strip.current.position.x = Math.sin(t * 0.35) * 9;
    if (orbit.current) orbit.current.rotation.y = t * 0.45;
  });

  return (
    <Environment resolution={512} frames={sweep ? Infinity : 1}>
      <color attach="background" args={["#030303"]} />

      {/* Sky: broad panel in front and above */}
      <Lightformer form="rect" intensity={2.4} position={[0, 4.05, 9]} scale={[34, 6.4, 1]} />
      {/* Horizon: thin hot line that draws the chrome's signature edge */}
      <Lightformer form="rect" intensity={9} position={[0, 0.74, 9]} scale={[34, 0.14, 1]} />
      <Lightformer form="rect" intensity={0.6} position={[0, -2.2, 9]} scale={[34, 0.6, 1]} />
      {/* Key overhead */}
      <Lightformer form="rect" intensity={3} position={[0, 8, 0]} scale={[14, 3, 1]} />
      {/* Floor bounce */}
      <Lightformer form="rect" intensity={0.25} position={[0, -7, 2]} scale={[20, 6, 1]} />
      {/* Travelling white highlight */}
      <group ref={strip}>
        <Lightformer form="rect" intensity={6} position={[0, 0, 8]} scale={[0.9, 14, 1]} />
      </group>
      {/* Colored gels circling the set */}
      <group ref={orbit}>
        {accents.map((color, i) => {
          const a = (i / accents.length) * Math.PI * 2;
          return (
            <Lightformer
              key={color}
              form="rect"
              color={color}
              intensity={9}
              position={[Math.sin(a) * 8, i % 2 ? 0.2 : 2.6, Math.cos(a) * 8]}
              scale={[6, 12, 1]}
            />
          );
        })}
      </group>
    </Environment>
  );
}
