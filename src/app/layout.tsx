import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Doçuras da Lara | Gestão",
    template: "%s | Doçuras da Lara",
  },
  description: "Gestão simples e cuidadosa da confeitaria Doçuras da Lara.",
  applicationName: "Doçuras da Lara",
  appleWebApp: { capable: true, title: "Doçuras da Lara", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f7ece7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
