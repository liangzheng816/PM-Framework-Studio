import type { Metadata } from "next";
import { getAllFrameworks } from "@/lib/frameworks";
import { FinderClient } from "./finder-client";

export const metadata: Metadata = {
  title: "Framework Finder",
  description: "Answer a few questions and get personalized PM framework recommendations.",
};

export default function FinderPage() {
  const frameworks = getAllFrameworks();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      <FinderClient frameworks={frameworks} />
    </div>
  );
}
