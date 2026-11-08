import { CatalogIndex } from "@/components/CatalogIndex";
import { ClosingStage } from "@/components/ClosingStage";
import { EditorialAlbumSection } from "@/components/EditorialAlbumSection";
import { HeroStage } from "@/components/HeroStage";
import { LightNav } from "@/components/LightNav";
import { RecordShelf } from "@/components/RecordShelf";
import { featuredReleases, releases } from "@/content/releases";

export default function Home() {
  return (
    <>
      <LightNav />
      <main>
        <HeroStage />
        <RecordShelf releases={releases} />
        <EditorialAlbumSection releases={featuredReleases} />
        <CatalogIndex releases={releases} />
      </main>
      <ClosingStage />
    </>
  );
}
