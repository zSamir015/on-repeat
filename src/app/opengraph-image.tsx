import { ImageResponse } from "next/og";
import { LOGO } from "@/components/brand/logo-geometry";

export const alt = "On Repeat — música nueva, presentada en grande";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RED = "#ee3a49";

/** Share card: the logo on the black stage, nothing else. */
export default function OpengraphImage() {
  const w = 900;
  const h = (w * LOGO.height) / LOGO.fullWidth;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72 }}>
        <div style={{ display: "flex", color: "#666", fontSize: 28 }}>Música nueva, presentada en grande</div>
        <svg width={w} height={h} viewBox={`0 ${LOGO.top} ${LOGO.fullWidth} ${LOGO.height}`}>
          {LOGO.full.map((p, i) =>
            p.t === "rect" ? (
              <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill="#fff" />
            ) : (
              <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={RED} />
            )
          )}
          <path d={LOGO.wordPath} fill="#fff" />
        </svg>
      </div>
    ),
    size
  );
}
