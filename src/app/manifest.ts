import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Doçuras da Lara | Gestão",
    short_name: "Doçuras da Lara",
    description: "Gestão simples e cuidadosa da confeitaria Doçuras da Lara.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f3ee",
    theme_color: "#f7ece7",
    icons: [
      { src: "/icons/app-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/app-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
