// Placeholder catalog built from well-known pop releases so the layout can be judged with real
// covers. Artwork and names belong to the artists and their labels; swap for On Repeat's own
// emerging artists before any public launch.

export type Release = {
  slug: string;
  artist: string;
  title: string;
  format: "Single" | "EP" | "Album";
  genre: string;
  year: number;
  blurb: string;
  /** Square cover art in /public/covers */
  cover: string;
  /** Color pulled from the cover; owns the whole surface while this release is on stage. */
  color: string;
  /** Text color with enough contrast on `color`. */
  ink: string;
  /** Lead single and its 30-second preview from the iTunes catalog. */
  track: string;
  preview: string;
};

export const spotifySearch = (r: { artist: string; title: string }) =>
  `https://open.spotify.com/search/${encodeURIComponent(`${r.artist} ${r.title}`)}`;

export const featuredDrop = {
  slug: "debi-tirar-mas-fotos",
  artist: "BAD BUNNY",
  artistMobile: "BAD\nBUNNY",
  title: "DeBÍ TiRAR MáS FOToS",
  format: "ALBUM",
  status: "Ya disponible · 2025",
  cover: "/covers/debi-tirar-mas-fotos.jpg",
  /** Gels that orbit the chrome: plantain green and late-afternoon sun from the cover. */
  accents: ["#4fa83a", "#ffb547"],
};

export const releases: Release[] = [
  {
    slug: "short-n-sweet",
    artist: "Sabrina Carpenter",
    title: "Short n' Sweet",
    format: "Album",
    genre: "Pop",
    year: 2024,
    blurb: "Pop corto y con veneno dulce. Doce canciones que no pierden el tiempo.",
    cover: "/covers/short-n-sweet.jpg",
    color: "#2a56a3",
    ink: "#fff4ea",
    track: "Espresso",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e8/30/ae/e830ae89-19ea-1dd2-dcfd-73b4abad39ba/mzaf_11294303823539932751.plus.aac.p.m4a",
  },
  {
    slug: "hit-me-hard-and-soft",
    artist: "Billie Eilish",
    title: "HIT ME HARD AND SOFT",
    format: "Album",
    genre: "Alt pop",
    year: 2024,
    blurb: "Para escuchar de corrido, con audífonos y la luz apagada.",
    cover: "/covers/hit-me-hard-and-soft.jpg",
    color: "#0e2840",
    ink: "#e9eef5",
    track: "BIRDS OF A FEATHER",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/31/d3/3431d34e-847f-5d66-df83-0bce688d997e/mzaf_18106743962423782018.plus.aac.p.m4a",
  },
  {
    slug: "midwest-princess",
    artist: "Chappell Roan",
    title: "The Rise and Fall of a Midwest Princess",
    format: "Album",
    genre: "Synth pop",
    year: 2023,
    blurb: "Brillo, drama y coros hechos para cantarlos a gritos con tus amigas.",
    cover: "/covers/midwest-princess.jpg",
    color: "#f2cfae",
    ink: "#5e1d0c",
    track: "Good Luck, Babe!",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c3/6d/4f/c36d4f23-b87f-046d-7a0e-e3e05d180b2a/mzaf_17235999651335214399.plus.aac.p.m4a",
  },
  {
    slug: "debi-tirar-mas-fotos",
    artist: "Bad Bunny",
    title: "DeBÍ TiRAR MáS FOToS",
    format: "Album",
    genre: "Música urbana",
    year: 2025,
    blurb: "Salsa, plena y reggaetón con nostalgia de Puerto Rico.",
    cover: "/covers/debi-tirar-mas-fotos.jpg",
    color: "#2e5a2b",
    ink: "#f4efd6",
    track: "DtMF",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d9/ea/9c/d9ea9c1c-4b31-c448-0882-f9bae822e1fd/mzaf_3206041669449949150.plus.aac.p.m4a",
  },
  {
    slug: "brat",
    artist: "Charli xcx",
    title: "BRAT",
    format: "Album",
    genre: "Dance pop",
    year: 2024,
    blurb: "Club, verde lima y cero filtro.",
    cover: "/covers/brat.jpg",
    color: "#8ace00",
    ink: "#000000",
    track: "360",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6a/b2/36/6ab236ac-6b8e-60e4-aa77-8e73c7127ebc/mzaf_17637473173165118705.plus.aac.p.m4a",
  },
  {
    slug: "radical-optimism",
    artist: "Dua Lipa",
    title: "Radical Optimism",
    format: "Album",
    genre: "Pop",
    year: 2024,
    blurb: "Pop de verano con psicodelia suave.",
    cover: "/covers/radical-optimism.jpg",
    color: "#0b5c63",
    ink: "#eef6f5",
    track: "Houdini",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2c/da/b5/2cdab5c6-04a8-5231-c697-00101e876479/mzaf_5586859405346659517.plus.aac.p.m4a",
  },
  {
    slug: "eternal-sunshine",
    artist: "Ariana Grande",
    title: "eternal sunshine",
    format: "Album",
    genre: "Pop / R&B",
    year: 2024,
    blurb: "Un álbum de ruptura que suena a terapia con buen beat.",
    cover: "/covers/eternal-sunshine.jpg",
    color: "#ba976c",
    ink: "#231710",
    track: "we can't be friends (wait for your love)",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/63/f1/45/63f1452d-5087-18b1-4426-52cd1f10bc06/mzaf_5211000209678891014.plus.aac.p.m4a",
  },
  {
    slug: "mayhem",
    artist: "Lady Gaga",
    title: "MAYHEM",
    format: "Album",
    genre: "Dance pop",
    year: 2025,
    blurb: "Vuelta a la pista: oscuro, teatral y bailable.",
    cover: "/covers/mayhem.jpg",
    color: "#c4c4c4",
    ink: "#111111",
    track: "Abracadabra",
    preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7f/f0/f5/7ff0f508-1e7a-fefc-0c78-5bd659286525/mzaf_16241395143868251571.plus.aac.p.m4a",
  },
];

export const featuredReleases = releases.slice(0, 3);

export const findRelease = (slug: string) => releases.find((r) => r.slug === slug);

/** The album's lead single, in the shape the player takes. */
export const leadSingle = (r: Release) => ({
  id: r.slug,
  track: r.track,
  artist: r.artist,
  album: r.title,
  cover: r.cover,
  color: r.color,
  ink: r.ink,
  preview: r.preview,
});
