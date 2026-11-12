
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERA | Gestão Inteligente de Irrigação",
  description: "Gestão inteligente de irrigação.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
