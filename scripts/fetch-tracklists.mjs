// Pulls each album's tracklist (names, durations, 30s previews) from the public iTunes lookup API
// into src/content/tracklists.json, so pages are static and the browser never calls iTunes.
// Usage: npm run tracklists
import { writeFileSync } from "node:fs";

const ALBUMS = {
  "short-n-sweet": ["Sabrina Carpenter", "short n' sweet"],
  "hit-me-hard-and-soft": ["Billie Eilish", "hit me hard and soft"],
  "midwest-princess": ["Chappell Roan", "the rise and fall of a midwest princess"],
  "debi-tirar-mas-fotos": ["Bad Bunny", "debi tirar mas fotos"],
  brat: ["Charli xcx", "brat"],
  "radical-optimism": ["Dua Lipa", "radical optimism"],
  "eternal-sunshine": ["Ariana Grande", "eternal sunshine"],
  mayhem: ["Lady Gaga", "mayhem"],
};

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const get = async (url) => (await fetch(url)).json();

const out = {};
for (const [slug, [artist, album]] of Object.entries(ALBUMS)) {
  const search = await get(`https://itunes.apple.com/search?${new URLSearchParams({ term: artist, entity: "musicArtist", limit: "5" })}`);
  const artistId = search.results.find((a) => norm(a.artistName) === norm(artist)).artistId;
  const albums = await get(`https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=200&country=US`);
  const match = albums.results
    .filter((a) => a.collectionName && norm(a.collectionName) === album)
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))[0];
  const songs = await get(`https://itunes.apple.com/lookup?id=${match.collectionId}&entity=song&country=US`);
  out[slug] = {
    released: match.releaseDate.slice(0, 10),
    copyright: match.copyright ?? null,
    tracks: songs.results
      .filter((t) => t.wrapperType === "track")
      .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber)
      .map((t) => ({ n: t.trackNumber, name: t.trackName, ms: t.trackTimeMillis, preview: t.previewUrl ?? null })),
  };
  console.log(slug, out[slug].tracks.length, "tracks");
}

writeFileSync("src/content/tracklists.json", JSON.stringify(out, null, 1) + "\n");
