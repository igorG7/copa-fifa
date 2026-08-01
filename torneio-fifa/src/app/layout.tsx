import type { Metadata } from "next";
import { Bebas_Neue, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/components/AdminContext";
import Navbar from "@/components/Navbar";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Torneio FIFA 17 — Entre Amigos",
  description: "Sorteio de grupos, tabela e chaveamento do torneio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body antialiased">
        <AdminProvider>
          <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 pb-16 pt-6 sm:px-6">
            <Navbar />
            <main className="mt-6 flex-1">{children}</main>
            <footer className="mt-16 border-t border-line pt-6 text-center text-xs tracking-widest2 text-muted">
              TORNEIO ENTRE AMIGOS · FIFA 17
            </footer>
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}
