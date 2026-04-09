"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

/** Hides the footer on full-screen pages like Coach (/). */
export function FooterGuard() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
