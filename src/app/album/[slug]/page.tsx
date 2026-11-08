import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumView } from "@/components/album/AlbumView";
import { findRelease, releases } from "@/content/releases";
import tracklists from "@/content/tracklists.json";

type Tracklists = Record<string, { released: string; copyright: string | null; tracks: { n: number; name: string; ms: number; preview: string | null }[] }>;

// Only the releases known at build time exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/album/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const release = findRelease(slug);
  if (!release) return {};
  return {
    title: `${release.title}, ${release.artist} — On Repeat`,
    description: release.blurb,
  };
}

export default async function AlbumPage({ params }: PageProps<"/album/[slug]">) {
  const { slug } = await params;
  const release = findRelease(slug);
  const data = (tracklists as Tracklists)[slug];
  if (!release || !data) notFound();

  const index = releases.indexOf(release);
  const next = releases[(index + 1) % releases.length];

  return <AlbumView release={release} tracks={data.tracks} released={data.released} copyright={data.copyright} next={next} />;
}
