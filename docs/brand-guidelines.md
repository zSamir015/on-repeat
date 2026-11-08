# On Repeat brand guidelines

The visual version of this document lives at `/marca` on the site.

## Idea

In sheet music, `‖:` opens a repeat and `:‖` closes it: everything between them is played again.
The logo puts the name between the two signs, so it literally reads as music on repeat.

## Logo

| Asset | File | Use |
|---|---|---|
| Full logo, black | `public/brand/on-repeat-logo-black.svg` | Default on light grounds |
| Full logo, white | `public/brand/on-repeat-logo-white.svg` | On black and dark album colors |
| Full logo, one color | `public/brand/on-repeat-logo-mono.svg` | Print, stamps, single-ink |
| Mark `‖:‖` | `public/brand/on-repeat-mark-black.svg`, `-white.svg` | Square spaces, avatars |
| App icon | `public/brand/on-repeat-app-icon.svg` | Store/app tiles |
| Favicon | `src/app/icon.svg` | Heavier cut so it survives 16 px |

- Construction: thick bar 11% of height, thin bar 3.5%, dots inside the lowercase x-height band.
  Word set in Inter Regular, lowercase, tracking −0.035em.
- Bars and word use the ink color of the surface; the dots are Ember Red. On album pages the whole
  logo, dots included, takes the album's ink color.
- Clear space: at least the width of one repeat sign on every side.
- Minimum size: full logo 20 px tall; below that use the mark (16 px minimum).
- Don't stretch it, recolor the dots, place it in rounded shapes, or add shadows.
- Regenerate every asset from source with `npm run fonts && npm run logo`.

## Color

| Name | Hex | Role |
|---|---|---|
| Obsidian | `#000000` | Stage, text on light |
| Paper | `#FFFFFF` | Gallery, text on dark |
| Ember Red | `#EE3A49` | Logo dots and short labels; never a background |
| Graphite | `#666666` | Secondary text on black |
| Signal Blue | `#007BFF` | Outlined actions on white |

Album colors come from each cover (`color` / `ink` in `src/content/releases.ts`). The brand stays
black, white and red; the record brings the color.

## Type

One family, Inter.

- Display: Light 300, 75–90 px, line-height 0.9–1.0, tracking −0.053em.
- Headings: Regular 400, 27–35 px.
- Body: Regular 400, 19–20 px, line-height 1.48.

## Shape and depth

Zero border radius everywhere. No shadows: depth comes from black/white contrast and type scale.

## Motion

The logo's bars rise and its dots pop in on first view; while a preview plays, the dots pulse with
the bass. Respect `prefers-reduced-motion`: no intro, no pulse.

## Voice

Direct, young, Spanglish: body copy in Spanish, short labels in English (NEW DROP, PREVIEW).
Buttons name their action and keep that name through the flow (Escuchar ↔ Pausar).

| Do | Don't |
|---|---|
| Escuchar preview | Click aquí para reproducir |
| Nada con “zzz”. Prueba con otro artista. | ¡Ups! Algo salió mal :( |
| Tu lanzamiento, presentado en grande. | La plataforma #1 de promoción musical |
