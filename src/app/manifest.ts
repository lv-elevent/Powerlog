import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { id: "/today", scope: "/", name: "Powerlog", short_name: "Powerlog", description: "把今天过得清楚一点", start_url: "/today", display: "standalone", background_color: "#f8fafc", theme_color: "#2563eb", lang: "zh-CN", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }, { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" }] };
}
