import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ČeskáVesnice.cz - digitální krajinná kronika",
  description:
    "Elegantní landing page projektu ČeskáVesnice.cz, digitální krajinné kroniky českých vesnic.",
};

export const viewport: Viewport = {
  themeColor: "#eef3e7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
