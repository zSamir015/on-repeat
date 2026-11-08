/**
 * Prefixes a /public path with the deploy base path. `next/link` applies `basePath` on its own,
 * but `next/image` sources, plain <a>/<img> tags and fetched files (the 3D typeface) do not.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
