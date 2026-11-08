"use client";

import dynamic from "next/dynamic";

// WebGL never renders on the server; load each scene only on the client.
export const ChromeWordmark = dynamic(() => import("./ChromeWordmark"), { ssr: false });
