import { useId, type ReactNode } from "react";
import { Logo } from "./brand/Logo";

type Props = {
  label?: string;
  href?: string;
  size?: number;
  className?: string;
  external?: boolean;
  /** Replaces the mark in the center, e.g. with a play/pause glyph. */
  center?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
};

/**
 * Circular brand badge: white disc, black text running the circumference, the ‖:‖ mark in the
 * center. The ring text rotates (CSS, linear, constant motion); the center stays put.
 */
export function RotatingBadge({ label = "ON REPEAT", href, size = 90, className = "", external, center, onClick, ariaLabel }: Props) {
  const pathId = useId();
  const ring = Array.from({ length: 4 }, () => `${label} •`).join(" ");

  const body = (
    <span className="relative block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="50" fill="var(--color-paper)" />
        <g className="spin-slow" style={{ transformOrigin: "50px 50px" }}>
          <defs>
            <path id={pathId} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text fontSize="10.4" fontWeight={500} letterSpacing="1.2" fill="var(--color-obsidian)">
            <textPath href={`#${pathId}`} textLength={238}>
              {ring}
            </textPath>
          </text>
        </g>
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="relative text-obsidian">
          {center ?? <Logo variant="mark" height={Math.round(size * 0.34)} />}
        </span>
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className={`group inline-block ${className}`}>
        <span className="block transition-transform duration-200 ease-[var(--ease-out)] group-active:scale-[0.96]">
          {body}
        </span>
      </button>
    );
  }

  if (!href) return <span className={className}>{body}</span>;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group inline-block ${className}`}
      aria-label={`${label}: abrir en Spotify`}
    >
      <span className="block transition-transform duration-200 ease-[var(--ease-out)] group-active:scale-[0.96]">
        {body}
      </span>
    </a>
  );
}
