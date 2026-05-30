import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { NavBar } from "@/components/layout/navbar";
import { FooterGuard } from "@/components/layout/footer-guard";
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

const fraunces = Fraunces({
  weight: ["400", "600", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PM Studio — PM Framework Learning Platform",
    template: "%s | PM Studio",
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
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
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
        <FooterGuard />
        <ClientShell searchIndex={searchIndex} />
      </body>
    </html>
  );
}
