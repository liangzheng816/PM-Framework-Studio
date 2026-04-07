import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { NavBar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ClientShell } from "@/components/layout/client-shell";
import { SkipNav } from "@/components/layout/skip-nav";
import searchIndexRaw from "@/data/search-index.json";
import type { SearchableFramework } from "@/lib/types";

const searchIndex = searchIndexRaw as SearchableFramework[];
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Framework Studio — PM Framework Learning Platform",
    template: "%s | Framework Studio",
  },
  description:
    "Discover, compare, and apply 100 product management frameworks. Source-verified, confidence-labeled, beautifully presented.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      {/* Plausible Analytics — uncomment and set data-domain once deployed:
      <head>
        <script defer data-domain="YOUR_DOMAIN.azurestaticapps.net" src="https://plausible.io/js/script.js" />
      </head>
      */}
      <body className="min-h-screen flex flex-col">
        <SkipNav />
        <NavBar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <ClientShell searchIndex={searchIndex} />
      </body>
    </html>
  );
}
