import type { Collection } from "./types";

const STORAGE_KEY = "fs:collections";
const DEFAULT_COLLECTION_ID = "saved";

function readCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollections(collections: Collection[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

function ensureDefault(collections: Collection[]): Collection[] {
  if (!collections.find((c) => c.id === DEFAULT_COLLECTION_ID)) {
    collections.unshift({
      id: DEFAULT_COLLECTION_ID,
      name: "Saved Frameworks",
      frameworkSlugs: [],
      createdAt: new Date().toISOString(),
    });
  }
  return collections;
}

export function getCollections(): Collection[] {
  return ensureDefault(readCollections());
}

export function getDefaultCollection(): Collection {
  const collections = getCollections();
  return collections.find((c) => c.id === DEFAULT_COLLECTION_ID)!;
}

export function isFrameworkSaved(slug: string): boolean {
  const collections = getCollections();
  return collections.some((c) => c.frameworkSlugs.includes(slug));
}

export function toggleSaveFramework(
  slug: string,
  collectionId: string = DEFAULT_COLLECTION_ID
): boolean {
  const collections = ensureDefault(readCollections());
  const col = collections.find((c) => c.id === collectionId);
  if (!col) return false;

  const idx = col.frameworkSlugs.indexOf(slug);
  if (idx >= 0) {
    col.frameworkSlugs.splice(idx, 1);
    writeCollections(collections);
    return false; // unsaved
  } else {
    col.frameworkSlugs.push(slug);
    writeCollections(collections);
    return true; // saved
  }
}

export function createCollection(name: string): Collection {
  const collections = ensureDefault(readCollections());
  const newCol: Collection = {
    id: `col-${Date.now()}`,
    name,
    frameworkSlugs: [],
    createdAt: new Date().toISOString(),
  };
  collections.push(newCol);
  writeCollections(collections);
  return newCol;
}

export function deleteCollection(id: string): void {
  if (id === DEFAULT_COLLECTION_ID) return;
  const collections = readCollections().filter((c) => c.id !== id);
  writeCollections(collections);
}
