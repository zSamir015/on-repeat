import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base for the share image and canonical URLs; set in the Pages deploy.
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: "On Repeat — música nueva de artistas emergentes",
  description:
    "Lanzamientos de artistas emergentes, presentados como se merecen. Pre-save, escucha y descubre el catálogo.",
  // Static share card (1200×630). Relative to metadataBase so it picks up the deploy sub-path.
  openGraph: { images: [{ url: "og.png", width: 1200, height: 630, alt: "On Repeat" }] },
  twitter: { card: "summary_large_image", images: ["og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <SmoothScroll />
        <PlayerProvider>
          {children}
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
