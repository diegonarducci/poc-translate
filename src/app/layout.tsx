import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POC Tradução Médica",
  description: "Comparador multi-motor de tradução para dados médicos sintéticos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
