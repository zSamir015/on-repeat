/** Play / pause glyph, drawn so both share one box and stroke weight. */
export function PlayIcon({ playing, size = 16 }: { playing: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden fill="currentColor">
      {playing ? (
        <>
          <rect x="3" y="2" width="3.5" height="12" />
          <rect x="9.5" y="2" width="3.5" height="12" />
        </>
      ) : (
        <path d="M4 1.5 L14 8 L4 14.5 Z" />
      )}
    </svg>
  );
}
