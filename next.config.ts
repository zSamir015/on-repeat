import type { NextConfig } from "next";

// Served from a sub-path on GitHub Pages (https://<user>.github.io/on-repeat/).
// Local dev and `next build` without the variable keep serving from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    // No image server in a static export; covers are already sized for the web.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
