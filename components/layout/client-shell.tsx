"use client";

import type { SearchableFramework } from "@/lib/types";
import { CommandPalette } from "@/components/search/command-palette";

interface ClientShellProps {
  searchIndex: SearchableFramework[];
}

export function ClientShell({ searchIndex }: ClientShellProps) {
  return <CommandPalette searchIndex={searchIndex} />;
}
