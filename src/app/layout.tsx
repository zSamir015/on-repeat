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
  title: "On Repeat — música nueva de artistas emergentes",
  description:
    "Lanzamientos de artistas emergentes, presentados como se merecen. Pre-save, escucha y descubre el catálogo.",
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
